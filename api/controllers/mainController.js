'use strict';
require('dotenv').config();
var mongoose = require('mongoose'),
    Account = mongoose.model('Accounts');

exports.list_all_accounts = function(req, res) {
    Account.find({}, function(err, account) {
        if(err)
        res.send(err);
        res.json(account);
    });
};

exports.create_account = function(req, res) {
    var new_account = new Account(req.body);
    new_account.save(function(err, account) {
        if(err) res.send(err);
        res.json(account);
    });
};

exports.read_account = function(req, res) {
    Account.findById(req.params.accountId, function(err, account) {
        if(err) res.send(err);
        res.json(account);
    });
}

exports.update_account = function(req, res) {
    Account.findOneAndUpdate({_id: req.params.accountId}, req.body, {new: true}, function(err, account) {
        if(err) res.send(err);
        res.json(account);
    });
};

exports.delete_account = function(req, res) {
    Account.remove({
        //'_id' : req.params.accountId
    }, function(err, account) {
        if(err) res.send(err);
        res.json({ message: 'Account successfully deleted'});
    });

};

exports.direct_to_home = function(req, res) {
    res.render('index', { 
        title: 'Snapfu Web API', 
        header1: 'Snapfu Web API Service',
        message: 'This is currently up for testing.'
    });
}

exports.check_status = function (req, res, next) {
    if (req.status == 200) {
        console.log('check status passed');
        next();
    } else {
        console.log('unauthorized');
        res.status(401).send('Unauthorized');
    }
};