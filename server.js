// Main file to start NodeJS React Server API
// Use to get env file
require('dotenv').config();

var app = require('express')(),
    http = require("http"),
    fs = require('fs'),
    port = process.env.REACT_APP_PORT,
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    dbUrl = process.env.REACT_APP_PROT_MONGODB,
    cors = require('cors'),
    getToken = require(process.env.REACT_APP_GET_TOKEN),
    auth_code = process.env.REACT_APP_AUTH_CODE,
    gcp_file = process.env.REACT_APP_GCP_GMAIL_FILE;


mongoose.Promise = global.Promise;
mongoose.connect(dbUrl).then(() => console.log('MongoDB Connected!'));

var Account = require('./api/models/mainModel'),
    Connection = require('./api/models/connectionModel'),
    Snap = require('./api/models/snapModel'),
    // import snapController and use function start_all_jobs
    snapController = require('./api/controllers/snapController');

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'pug');
// reference to public folder for static file style.css
app.use('/public', require('express').static('public'));

var routes = require('./api/routes/mainRoutes');
routes(app);


app.listen(port, function () {
    console.log('Snapfu API server started on: ' + port);
    // Call snapController function start_all_snaps
    snapController.start_all_snaps_auto();
    // get current time in milliseconds
    var current_time = new Date().getTime();
    var cred_expiry = 0;

    fs.readFile(gcp_file, function (err, data) {
        if (err) {
            console.log(err);
        }
        var f = JSON.parse(data);
        cred_expiry = f['expiry_date'];

        // if current time is greater than expiry time, get new token
        if (current_time > cred_expiry) {
            if (getToken(auth_code)) {
                console.log('INFO: Token for email sending is updated.');
            } else {
                console.log('ERROR: Token for email sending is expired.\nStop server and get new token by calling "node get_urls.js" in the terminal.\nUpdate env file with new auth code.');
            }
        } else {
            console.log('INFO: Token for email sending is not expired.');
        }
    });
});


app.use(function (req, res) {
    res.status(404).send({
        url: req.originalUrl + ' not found'
    });
});
