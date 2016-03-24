'use strict';
var fs = require('fs');
var stud = require('./students');

var Session = function (file, io) {
    var questions = this.questions = JSON.parse(fs.readFileSync(file));
    var currentQuestionIndex = this.currentQuestionIndex = -1;
    var currentQuestion = this.currentQuestion;
    var correctAnswer = this.correctAnswer;
    var students = this.students = new stud();

    var nextQuestion  = function () {
        currentQuestionIndex += 1;
        currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
            correctAnswer = currentQuestion.answer - 1;//-1 is because answerAnswer is not 0-based index
        }
    };

    nextQuestion();
    // socket.io events for answering session
    io.on('connection', function (socket) {

        //socket.score = 0;

        console.log('a user connected...login');
        //socket.emit('questions:init', currentQuestion);

        socket.on('question:pullCurrent', function (blank, sendCurrentQuestion) {
            sendCurrentQuestion(currentQuestion);
        });

        socket.on('user:login', function (username, isTaken) {
            if (!socket.username) {
                socket.username = username;
                if (!students.isRegistered(username)) {
                    console.log('no registered');
                    students.push(socket.username);
                }
            }
            isTaken(false);
            console.log('a user connected ' + socket.username);
        });
        socket.on('student:score', function (answer) {
            socket.answer = answer;
            if (answer === correctAnswer) {
                //socket.score += 1;
                students.addPoints(socket.username, 1);
            }
            socket.answer = -1;//clear answer
        });
        socket.on('questions:next', function (msg, setNextQuestion) {
            nextQuestion();
            setNextQuestion(currentQuestion);
            //send the new question to all students
            io.emit('questions:change', currentQuestion);
        });
        socket.on('presenter:showAnswer', function (correctAnswer) {
            io.emit('showAnswer', correctAnswer);
        });
        socket.on('student:getScore', function (username, returnScore) {
            var score = students.getScore(username);
            var questionsTotal = questions.length;
            returnScore(score, questionsTotal);
        });
        socket.on('disconnect', function () {
            console.log('user disconnected ' + socket.username);
        });
    });

    /*
     return {
     questions: questions,
     nextQuestion: nextQuestion,
     currentQuestion: currentQuestion
     };*/
};

module.exports = Session;