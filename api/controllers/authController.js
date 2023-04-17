'use strict';

require('dotenv').config();
var mongoose = require('mongoose'),
  Account = mongoose.model('Accounts'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  config = {},
  fs = require('fs'),
  path = require('path');

// ENV
var gcp_file = process.env.REACT_APP_GCP_FILE,
  gcp_gmail_creds_file = process.env.REACT_APP_GCP_GMAIL_FILE,
  api_host = process.env.REACT_APP_SERVER_URL + ':' + process.env.REACT_APP_PORT,
  //auth_code = process.env.REACT_APP_AUTH_CODE,
  token_exp = process.env.REACT_APP_TOKEN_EXP,
  // gmail sender from .env
  gmail_sender = process.env.REACT_APP_GMAIL_SENDER;

config.secret = process.env.REACT_APP_PROT_CONFIG;

const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const { nextTick } = require('process');


exports.register_account = function (req, res) {

  //console.log('req body: ' + JSON.stringify(req));
  var usernameStat = 0;
  var emailStat = 0;

  Account.find({ 'username': req.body.username }, function (err, user) {
    if (err) {
      console.log('err: ' + err);
      return res.status(500).send({ message: "There was a problem finding the user. Error: " + err });
    }

    if (isEmpty(user)) {
      usernameStat = 1;
      Account.find({ 'email': req.body.email }, function (err, user) {
        if (err) {
          return res.status(500).send({ message: "There was a problem finding the email. Error: " + err });
        }

        if (isEmpty(user)) {
          emailStat = 1;
          var hashedPassword = bcrypt.hashSync(req.body.password, 8);

          function newAccount(firstname, lastname, username, password, email, apiKey) {
            this.firstname = firstname;
            this.lastname = lastname;
            this.username = username;
            this.password = password;
            this.email = email;
            this.apiKey = apiKey;
          };

          var new_account = new newAccount(req.body.firstname, req.body.lastname, req.body.username, hashedPassword, req.body.email, 'No API');

          var register_account = new Account(new_account);

          register_account.save(function (err, user) {
            if (err) return res.status(500).send({ message: "There was a problem registering the user: " + err });
            // create a token
            var token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: token_exp // expires in 24 hours
            });

            // TODO: don't use header to pass token, add it in response obj
            res.setHeader('key', token);
            return res.status(200).send({ auth: true, token: token, message: 'Successfully registered' });

          });
        } else {
          return res.status(404).send({ message: "Email address already exists!" });
        }
      });
    } else {
      console.log('user: ' + user);
      return res.status(404).send({ message: "Username already exists!" });

    }

  });

};

exports.verify_account = function (req, res) {
  var token = req.params.tokenId;
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    //res.status(200).send(decoded);
    //res.json(decoded);
    Account.update({ '_id': decoded.id }, { status: ['verified'], 'apiKey': token }, function (err, numAffected) {
      if (err) console.log(err);
      console.log('Updated: ' + JSON.stringify(numAffected));

      //res.status(200).send(JSON.stringify(numAffected));
      res.status(200).render('welcome', {
        title: 'Snapfu',
        header1: 'Congratulations!',
        message: 'You have successfully verified your account.'
      });
    });
  });
}

exports.view_account = function (req, res) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    //res.status(200).send(decoded);
    //res.json(decoded);
    Account.find({ '_id': decoded.id }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");

      res.status(200).send(user);
    });
  });
};

exports.check_token = function (req, res, next) {
  var token = req.headers['x-access-token'];
  console.log('token: ' + token);
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function (err, decoded) {
    console.log('decoded: ' + decoded);
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token. Error: ' + err });

    console.log('token checked')
    next();
  });
};


exports.check_login = function (req, res) {
  console.log('data: ' + String(req));
  Account.find({ 'username': req.body.username }, function (err, user) {
    if (err) return res.status(500).send({ message: "There was a problem finding the user." });

    if (Object.keys(user).length === 0) {
      return res.status(404).send({ message: "No user found." });

    } else {
      bcrypt.compare(req.body.password, user[0].password, function (err, result) {
        if (err) return res.send(err);

        if (result) {
          console.log('result: ' + result);
          var token = jwt.sign({ id: user[0]._id }, config.secret, {
            expiresIn: token_exp 
          });

          if (!token) return res.status(401).send({ auth: false, message: 'No API' });

          return res.status(200).send({ auth: true, message: 'Successfully logged in', token: token });

        } else {
          return res.status(403).send({ auth: false, message: 'Incorrect username and password.' });

        }

      });
    }
  });
};

exports.send_email_verification = function (req, res) {

  getOAuth2Client(function (err, oauth2Client) {
    if (err) {
      console.log('err:', err);
    } else {
      sendSampleMail(oauth2Client, req, function (err, results) {
        if (err) {
          console.log('err:', err);
        } else {
          console.log(results);
          return res.status(200).send({ message: 'Email Verification Sent!' });
        }
      });
    }
  });
}

function getOAuth2Client(cb) {
  // Load client secrets
  fs.readFile(gcp_file, function (err, data) {
    if (err) {
      return cb(err);
    }
    var credentials = JSON.parse(data);
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    //var auth = new googleAuth();
    var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

    // Load credentials
    fs.readFile(gcp_gmail_creds_file, function (err, token) {
      if (err) {
        return cb(err);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        return cb(null, oauth2Client);
      }
    });
  });
}

function sendSampleMail(auth, par, cb) {
  var gmailClass = google.gmail('v1');

  var cleancode = par.body.code;
  cleancode = cleancode.replace(/['"]+/g, "");
  var email_lines = [];

  email_lines.push('From: "Snapfu PH" ' + gmail_sender);
  email_lines.push('To: ' + par.body.email);
  email_lines.push('Content-type: text/html;charset=iso-8859-1');
  email_lines.push('MIME-Version: 1.0');
  email_lines.push('Subject: Snapfu - Verification');
  email_lines.push('');
  email_lines.push('<p>Click the link to verify your account. </p>');
  email_lines.push('<p>Email: <a href="' + api_host + '/api/verify/' + cleancode + '" target="_blank">Verify Account</a></p>');

  var email = email_lines.join('\r\n').trim();

  var base64EncodedEmail = new Buffer(email).toString('base64');
  base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

  gmailClass.users.messages.send({
    auth: auth,
    userId: 'me',
    resource: {
      raw: base64EncodedEmail
    }
  }, cb);
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}