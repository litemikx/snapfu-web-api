

function getToken(code) {
    var fs = require('fs');
    require('dotenv').config();
    const path = require('path');
    let { OAuth2Client } = require('google-auth-library');

    const gcp_file = process.env.REACT_APP_GCP_FILE,
        gcp_gmail_creds_file = process.env.REACT_APP_GCP_GMAIL_FILE;

    function getAuthorizationToken(code, cb) {
        // Load client secrets
        fs.readFile(gcp_file, function (err, data) {
            if (err) {
                return cb(err);
            }
            var credentials = JSON.parse(data);
            var clientSecret = credentials.web.client_secret;
            var clientId = credentials.web.client_id;
            var redirectUrl = credentials.web.redirect_uris[0];
            
            var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

            console.log('oauth2Client: ' + JSON.stringify(oauth2Client));
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    return cb(err);
                }
                var file = gcp_gmail_creds_file;

                fs.writeFileSync(file, JSON.stringify(token));
                return cb(null, file);
            });
        });
    }

    var token = code
    console.log('token: ' + token);

    getAuthorizationToken(token, function (err, file) {
        if (err) {
            console.log('err:', err);
        } else {
            console.log('authorization token is in:\n', file);
        }
    });
}

module.exports = getToken;