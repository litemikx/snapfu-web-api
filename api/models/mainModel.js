'user strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
    firstname: {
        type: String,
        required: 'Kindly enter the first name of the account'
    },
    lastname: {
        type: String,
        require: 'Kindly enter last name of account'
    },
    username: {
        type: String,
        required: 'Kindly enter a username'
    },
    password: {
        type: String,
        required: 'Kindly enter a password'
    },
    email: {
        type: String,
        required: 'Kindly enter a valid email address'
    },
    /*mobile: {
        type: String,
        required: 'Kindly enter a valid mobile phone number'
    },*/
    apiKey: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: [{
            type: String,
            enum: ['pending', 'verified']
        }],
        default: ['pending']
    }

});

module.exports = mongoose.model('Accounts', AccountSchema);