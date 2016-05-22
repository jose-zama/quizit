'use strict';
var express = require('express');
var router = express.Router();
var app = express();
var Quiz = require('../QuizSession.js');
var jwt = require('jsonwebtoken');
var quizzes = require('../model/quizzes');

var viewsPath = app.get('views') + '/session';

/* RUN quiz */
router.post('/:quizId', function (req, res, next) {
    var QuizesRunning = req.app.get('quizesRunning');
    var quizMap = req.app.get('quizMap');
    var quizId = req.params.quizId;

    //Check if already running, otherwise create a new quiz session
    if (QuizesRunning[quizId] === undefined) {
        var userProfile = jwt.decode(req.cookies.auth);
        quizzes.get(quizId, userProfile.id, function (err, quiz) {
            if (err) {
                err.status = err.status || 500;
                return next(err);
            }

            //The quizMap contains a relationship of name/quizID.
            //This is used to mantain a friendly and readable URL to give to 
            //the students, instead of using the long quiz ID.
            //The following generates a unique name from the title of the quiz.
            var name = quiz.title;
            name = name.trim().replace(/\s+/g, "_");
            var x = 1;
            while (quizMap[name]) {
                name = name + "_" + x;
                x++;
            }
            quizMap[name] = quizId;

            var io = req.app.get('io');
            var nsp = io.of('/' + name);
            QuizesRunning[quizId] = new Quiz(name, quiz, nsp);

            res.json({
                status: 'created',
                title: quiz.title,
                sessionName: name
            });
        });


    } else {
        //already running
        var title = QuizesRunning[quizId].title;
        var name = QuizesRunning[quizId].sessionName;
        res.json({
            status: 'running',
            title: title,
            sessionName: name
        });
    }
});

/* GET quiz */
router.get('/:quizName', function (req, res, next) {
    var quizMap = req.app.get('quizMap');
    var quizId = quizMap[req.params.quizName];

    //If the quiz is already running
    if (quizId !== undefined) {
        res.sendFile(viewsPath + '/question.html');
    } else {
        //if the quiz has not started,in other words does not exist
        res.render(viewsPath + '/missing', {quiz: req.params.quizName});
    }

    /*
     var QuizesRunning = req.app.get('quizesRunning');
     
     //If the quiz is already running
     if (QuizesRunning[req.params.quizId] !== undefined) {
     res.sendFile(viewsPath + '/question.html');
     } else {
     //if the quiz has not started,in other words does not exist
     res.render(viewsPath + '/missing', {quiz: req.params.quizId});
     }
     */

});

/* DELETE quiz session*/
router.delete('/:quizName', function (req, res, next) {
    var sessionName = req.params.quizName;
    var quizMap = req.app.get('quizMap');
    var quizId = quizMap[sessionName];
    var QuizesRunning = req.app.get('quizesRunning');
    var io = req.app.get('io');

    //If the quiz is running
    if (quizId !== undefined) {
        delete QuizesRunning[quizId];
        delete quizMap[sessionName];
        for (var id in io.of('/' + sessionName).connected) {
            var s = io.of('/' + sessionName).connected[id];
            s.disconnect();
        }
        delete io.nsps['/' + sessionName];
        res.json({status: "ok"});

    } else {
        //if the quiz has not started,in other words does not exist
        res.json({status: "missing"});
    }


});

/* GET results. */
router.get('/:quizName/results', function (req, res, next) {
    var quizMap = req.app.get('quizMap');

    var quizId = quizMap[req.params.quizName];
    //If the quiz is already running
    if (quizId !== undefined) {
        var QuizesRunning = req.app.get('quizesRunning');
        var results = QuizesRunning[quizId].students.toArray();
        res.render(viewsPath + '/results', {results: results});
    } else {
        //if the quiz has not started,in other words does not exist
        res.render(viewsPath + '/missing', {quiz: req.params.quizName});
    }

    /*
     var QuizesRunning = req.app.get('quizesRunning');
     
     //If the quiz is already running
     if (QuizesRunning[req.params.quizId] !== undefined) {
     var results = QuizesRunning[req.params.quizId].students.toArray();
     res.render(viewsPath + '/results', {results: results});
     } else {
     //if the quiz has not started,in other words does not exist
     res.render(viewsPath + '/missing', {quiz: req.params.quizId});
     }
     */
});

module.exports = router;
