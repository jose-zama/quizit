var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");
var students = require('./students');
var Quiz = require('./QuizSession.js')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// set the view engine to ejs
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/presenter/results', function (req, res, next) {
    req.students = students.array;
    console.log(students.array);
    next();
});

app.use('/presenter/questions', function (req, res, next) {
    if (quiz) {
        console.log(quiz.currentQuestion);
        console.log('cacaaaa');
        if (quiz.currentQuestion) {
            console.log(quiz.currentQuestion);
            next();
        } else {
            res.redirect('/presenter/results');
        }
    } else {
        next();
    }
});

var routes = require('./routes/index');
var users = require('./routes/quiz');
var student = require('./routes/student');
var presenter = require('./routes/presenter');

app.use('/', routes);
app.use('/quiz', users);
app.use('/student', student);
app.use('/presenter', presenter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Socket.io
var io = socket_io();
app.io = io;

/*
 //Data model
 var questions = require('./models/data.json');
 var currentQuestionIndex = -1;
 var currentQuestion;
 var correctAnswer;
 
 var score = 0;
 //var answer = -1;
 
 
 var nextQuestion = function () {
 currentQuestionIndex += 1;
 currentQuestion = questions[currentQuestionIndex];
 if (currentQuestion) {
 correctAnswer = currentQuestion.answer - 1;//-1 is because answerAnswer is not 0-based index
 console.log(currentQuestion);
 }
 };
 
 nextQuestion();
 */
// socket.io events for answering session

var quiz;
io.on('connection', function (socket) {

    quiz = new Quiz();
    //quiz.nextQuestion();
    socket.score = 0;

    console.log('a user connected...login');
    //socket.emit('questions:init', currentQuestion);

    socket.on('question:pullCurrent', function (blank, sendCurrentQuestion) {
        sendCurrentQuestion(quiz.currentQuestion);
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
        console.log('correctAnswer: ' + quiz.correctAnswer);
        console.log('answer: ' + answer);
        socket.answer = answer;
        if (answer === quiz.correctAnswer) {
            socket.score += 1;
            students.addPoints(socket.username, 1);
        }
        console.log(socket.username + ' answer: ' + answer + ', score: ' + socket.score);
        //students[socket.username].score = socket.score;
        socket.answer = -1;//clear answer
    });
    socket.on('questions:next', function (msg, setNextQuestion) {
        quiz.nextQuestion();
        setNextQuestion(quiz.currentQuestion);
        //send the new question to all students
        io.emit('questions:change', quiz.currentQuestion);
    });
    socket.on('presenter:showAnswer', function (correctAnswer) {
        io.emit('showAnswer', correctAnswer);
    });
    socket.on('student:getScore', function (username, returnScore) {
        var score = students.getScore(username);
        var questionsTotal = quiz.questions.length;
        returnScore(score, questionsTotal);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected ' + socket.username);
    });
});

module.exports = app;
