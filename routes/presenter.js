'use strict';
var express = require('express');
var router = express.Router();
var app = express();
var Quiz = require('../QuizSession.js');

var viewsPath = app.get('views') + '/session';

/* RUN quiz */
router.post('/:quizId', function (req, res, next) {
    var QuizesRunning = req.app.get('quizesRunning');
    //Check if already running, otherwise create a new quiz session
    if (QuizesRunning[req.params.quizId] === undefined) {
        var io = req.app.get('io');
        var nsp = io.of('/' + req.params.quizId);
        
        QuizesRunning[req.params.quizId] = new Quiz('./models/' + req.params.quizId + '.json', nsp);
        res.json({
            status: 'created',
            url: ''
        });
    } else {
        //already running
        res.json({
            status: 'running',
            url: ''
        });
    }
});

/* GET quiz */
router.get('/:quizId', function (req, res, next) {
    var QuizesRunning = req.app.get('quizesRunning');

    //If the quiz is already running
    if (QuizesRunning[req.params.quizId] !== undefined) {
        res.sendFile(viewsPath + '/question.html');
    } else {
        //if the quiz has not started,in other words does not exist
        res.render(viewsPath + '/missing', {quiz: req.params.quizId});
    }


});

/* DELETE quiz session*/
router.delete('/:quizId', function (req, res, next) {
    var QuizesRunning = req.app.get('quizesRunning');
    var io = req.app.get('io');

    //If the quiz is already running
    if (QuizesRunning[req.params.quizId] !== undefined) {
        delete QuizesRunning[req.params.quizId];
        for (var id in io.of('/' + req.params.quizId).connected) {
            var s = io.of('/' + req.params.quizId).connected[id];
            s.disconnect();
        }
        delete io.nsps['/' + req.params.quizId];
        res.json({status: "ok"});
    } else {
        //if the quiz has not started,in other words does not exist
        res.json({status: "missing"});
    }


});

/* GET results. */
router.get('/:quizId/results', function (req, res, next) {
    var QuizesRunning = req.app.get('quizesRunning');
    
    //If the quiz is already running
    if (QuizesRunning[req.params.quizId] !== undefined) {
        var results = QuizesRunning[req.params.quizId].students.toArray();
        res.render(viewsPath + '/results', {results: results});
    } else {
        //if the quiz has not started,in other words does not exist
        res.render(viewsPath + '/missing', {quiz: req.params.quizId});
    }
});

module.exports = router;
