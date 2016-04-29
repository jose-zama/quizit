'use strict';
var fs = require('fs');
var express = require('express');
var router = express.Router();
var app = express();
var quizzes = require('../model/quizzes');
var jwt = require('jsonwebtoken');


// RESTful app for CRUD operations of questions
//https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular


router.get('/', function (req, res, next) {
    var userProfile = jwt.decode(req.cookies.auth);
    quizzes.getUserQuizzes(userProfile.id, function (err, quizzes) {
        if (err) {
            err.status = err.status || 500;
            return next(err);
        }
        res.json(quizzes);
    });
});

router.get('/:id', function (req, res, next) {
    var userProfile = jwt.decode(req.cookies.auth);
    quizzes.get(req.params.id, userProfile.id, function (err, quiz) {
        if (err) {
            err.status = err.status || 500;
            return next(err);
        }
        res.json(quiz);
    });
});


router.post('/:title', function (req, res, next) {
    var questions = req.body.questions;
    var title = req.params.title;
    var quizId = req.body.quizId;
    var userProfile = jwt.decode(req.cookies.auth);
    quizzes.save(userProfile.id, quizId, title, questions, function (err, id) {
        if (err) {
            err.status = 500;
            return next(err);
        }
        res.json({status: "ok", id: id});
    });
});

router.delete('/:id', function (req, res, next) {
    var userProfile = jwt.decode(req.cookies.auth);
    var quiz = req.params.id;
    quizzes.delete(quiz, userProfile.id, function (err, quizzes) {
        if (err) {
            err.status = err.status || 500;
            return next(err);
        }
        res.json({status: "ok"});
    });
});

module.exports = router;
