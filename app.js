var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");

var app = express();

//app.set('views', path.join(__dirname, 'views'));
//
//// view engine setup
//app.set('view engine', 'jade');

// set the view engine to ejs
app.set('view engine', 'ejs');

//Control of quizes running
app.set('quizesRunning',{});

// Socket.io
var io = socket_io();
app.io = io;
app.set('io',io);



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/dashboard');
var quizEditor = require('./routes/quiz');
var student = require('./routes/student');
var presenter = require('./routes/presenter');

app.use('/', routes);
app.use('/quiz', quizEditor);
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


module.exports = app;
