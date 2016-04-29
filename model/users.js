'use strict';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var config = require('../config');

var db, users, loaded = false;
exports.init = function (_db_) {
    db = _db_;
    users = db.collection('users');
    loaded = true;
};

exports.login = function (email, password, callback) {
    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    var token;
    users.find({email: email}).next(function (err, user) {
        if (err) {
            callback(err, undefined);
            return;
        }
        if (!user) {
            err = new Error('User not found');
            callback(err, undefined);
            return;
        }
        if (!bcrypt.compareSync(password, user.password)) {
            err = new Error('Wrong credentials');
            callback(err, undefined);
            return;
        }

        var profile = {
            id: user._id,
            email: email
        };
        // We are sending the profile inside the token
        token = jwt.sign(profile, config.secret, {expiresIn: "7d"});
        callback(undefined, token);
    });
};

exports.register = function (email, password, callback) {
    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    var token;
    users.insertOne({email: email, password: hash(password), quizzes:{owns:[]}}, function (err, response) {
        if (err) {
            callback(err, undefined);
            return;
        }
        var profile = {
            id: response.insertedId,
            email: email
        };
        // We are sending the profile inside the token
        token = jwt.sign(profile, config.secret, {expiresIn: "7d"});
        callback(undefined, token);
    });
};

var hash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};