'user strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConnectionSchema = new Schema({
    name : {
        type: String,
        required: 'Kindly enter the connection name'
    },
    host: {
        type: String,
        required: 'Kindly enter the connection host url'
    },
    port: {
        type: String,
        required: 'Kindly enter the connection host port'
    },
    auth: {
        type: String,
        required: 'This is the Basic Authentication Base64 String.'
    },
    auth_type: {
        type: [{
            type: String,
            enum: ['', 'basic']
        }],
        default: ['']
    },
    file_path: {
        type: String,
        required: 'This is absolute file path of the executable file.'
    },
    server_os_type: {
        type: [{
            type: String,
            enum: ['', 'linux', 'windows']
        }],
        default: ['']
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: [{
            type: String,
            enum: ['active', 'inactive']
        }],
        default: ['inactive']
    }

});

module.exports = mongoose.model('Connections', ConnectionSchema);