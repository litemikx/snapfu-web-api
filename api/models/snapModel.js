'user strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChannelSchema = new Schema({
    name: {
        type: String
    },
    id: {
        type: String
    }
});

var SnapSchema = new Schema({
    name : {
        type: String,
        required: 'Kindly enter the connection name'
    },
    channels: {
        type: [ChannelSchema],
        required: 'Kindly add at least 1 channel.'
    },
    exec_path: {
        type: String,
        required: 'This is the absolute folder path where the exec file is located.'
    },
    folder_path: {
        type: String,
        required: 'This is the absolute folder path where the backup script and files are created.'
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
    },
    cron_expression: {
        type: String,
        required: 'Kindly enter the cron expression.'
    },
    connection_id: {
        type: String,
        required: 'Kindly enter the connection id.'
    }
});

module.exports = mongoose.model('Snaps', SnapSchema);