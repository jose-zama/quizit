'use strict';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var config = require('../config');
var ObjectID = require('mongodb').ObjectID;

var db, users, quizzes, loaded = false;
exports.init = function (_db_) {
    db = _db_;
    users = db.collection('users');
    quizzes = db.collection('quizzes');
    loaded = true;
};

//check if this implementation is the correct way to do it
exports.getUserQuizzes = function (userId, callback) {
    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    users.find({_id: new ObjectID.createFromHexString(userId)}, {_id: 0, "quizzes.owns": 1}).limit(1).next(function (err, res) {
        if (err) {
            callback(err, undefined);
            return;
        }
        var quizzesArray = [];
        var quizzesIds = res.quizzes.owns;

        quizzes.find({_id: {$in: quizzesIds}}, {title: 1}).toArray(function (err, quizzesTitles) {
            if (err) {
                throw err;
            }
            for (var i = 0; i < quizzesTitles.length; i++) {
                var quiz = quizzesTitles[i];
                var obj = {};
                obj.id = quiz._id;
                obj.title = quiz.title;
                quizzesArray.push(obj);
            }
            callback(undefined, quizzesArray);
        });


    });
};

exports.get = function (quizId, userId, callback) {

    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    var id;
    try {
        id = new ObjectID.createFromHexString(quizId);
    } catch (err) {
        err.status = 400;
        callback(err, undefined);
        return;
    }

    users.find({_id: new ObjectID.createFromHexString(userId), "quizzes.owns": id}).limit(1).next(function (err, res) {
        if (err) {
            callback(err, undefined);
            return;
        }
        if (!res) {
            var err = new Error("Quiz not owned by user");
            err.status = 403;
            callback(err, undefined);
            return;
        }
        quizzes.find({_id: id}).limit(1).next(function (err, quiz) {
            if (err) {
                callback(err, undefined);
                return;
            }
            if (!quiz) {
                var err = new Error("Quiz missing");
                err.status = 404;
                callback(err, undefined);
                return;
            }
            callback(undefined, quiz);
        });
    });
};

exports.save = function (userId, quizId, title, questions, callback) {
    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    //update record
    if (quizId) {
        quizzes.updateOne({_id: new ObjectID.createFromHexString(quizId)}, {$set: {title: title, questions: questions}}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, quizId);
        });

    } else {
        //create new record
        quizzes.insertOne({title: title, questions: questions}, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            //User/quiz relationship
            //var quizId = new ObjectID.createFromHexString(result.insertedId);
            console.log(userId);
            users.updateOne({_id: new ObjectID.createFromHexString(userId)},
                    {$push: {"quizzes.owns": result.insertedId}},
                    function (err, r) {
                        if (err) {
                            //fallback: remove the quiz inserted in quizzes collection 
                            quizzes.remove({_id: result.insertedId});
                            callback(err);
                            return;
                        }
                        callback(undefined, result.insertedId);
                    });
        });
    }
};

exports.delete = function (quizId, userId, callback) {

    if (loaded === false)
        throw new Error('Service not initialized. Make sure init() is called first.');

    var id;
    try {
        id = new ObjectID.createFromHexString(quizId);
    } catch (err) {
        err.status = 400;
        callback(err, undefined);
        return;
    }

    //check if user is owner
    users.find({_id: new ObjectID.createFromHexString(userId), "quizzes.owns": id}).limit(1).next(function (err, res) {
        if (err) {
            callback(err, undefined);
            return;
        }
        if (!res) {
            var err = new Error("Quiz not owned by user");
            err.status = 403;
            callback(err, undefined);
            return;
        }
        //then delete quiz
        quizzes.deleteOne({_id: id}, function (err, res) {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined);
        });
    });
};
