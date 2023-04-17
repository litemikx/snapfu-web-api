'use strict';
require('dotenv').config();
var mongoose = require('mongoose'),
    Connection = mongoose.model('Connections');

exports.list_connections = function(req, res) {
    Connection.find({}, function(err, connection) {
        if(err) res.send(err);

        res.json(connection);
    });
};

exports.create_connection = function(req, res) {
    var new_connection = new Connection(req.body);
    new_connection.save(function(err, connection) {
        if(err) res.send(err);

        res.json({ message: 'Successfully created connection'});
    });
};

exports.read_connection = function(req, res) {
    Connection.findById(req.params.connectionId, function(err, connection) {
        if(err) res.send(err);
        res.json(connection);
    });
}

exports.update_connection = function(req, res) {
    Connection.findOneAndUpdate({_id: req.params.connectionId}, req.body, {new: true}, function(err, connection) {
        if(err) res.send(err);
        res.json({ message: 'Connection successfully updated.'});
    });
};

exports.delete_connection = function(req, res) {
    Connection.remove({
        _id : req.params.connectionId
    }, function(err, connection) {
        if(err) res.send(err);
        res.json({ message: 'Connection successfully deleted.'});
    });

};

