
require('dotenv').config();
var fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const gcp_file = process.env.REACT_APP_GCP_FILE;
var scopes = require('./scopes');

function getAuthorizationUrl(cb) {
    // Load client secrets
    fs.readFile(gcp_file, function (err, data) {
        if (err) {
            return cb(err);
        }
        var credentials = JSON.parse(data);
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var redirectUrl = credentials.web.redirect_uris[0];
        //let auth = new googleAuth();
        var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        return cb(null, authUrl);
    });
}

getAuthorizationUrl(function (err, url) {
    if (err) {
        console.log('err:', err);
    } else {
        console.log('Authorization url is:\n', url);
    }
});

