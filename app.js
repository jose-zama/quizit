var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");
//var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var config = require('./config');
var MongoClient = require('mongodb').MongoClient;
//var passport = require('passport');

var app = express();

//app.set('views', path.join(__dirname, 'views'));
//
//// view engine setup
//app.set('view engine', 'jade');

// set the view engine to ejs
app.set('view engine', 'ejs');

//Control of quizes running
app.set('quizMap', {});
app.set('quizesRunning', {});

// Socket.io
var io = socket_io();
app.io = io;
app.set('io', io);

// set key for users authentication 'jsonwebtoken'
//app.set('secretKey', config.secret); // secret variable

//MongoDB setup
//connect to the Server 
var db;
app.connectDb = function (callback) {
    MongoClient.connect(config.dbUrl, function (err, db_) {
        db = db_;
        callback(err, db_);

        //Once the DB conecction is Ok we load those services
        //that use it
        require('./model/users').init(db);
        require('./model/quizzes').init(db);
    });
};

//Passport setup
//require('./passport')(passport, db);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
//app.use(passport.initialize());

var routes = require('./routes/dashboard');
var auth = require('./routes/auth');
var quizEditor = require('./routes/quiz');
var student = require('./routes/student');
var presenter = require('./routes/presenter');

//unprotected routes, anyone can enter
app.use('/auth', auth);
app.use('/answer', student);

//protected routes, need to login
app.use('/', expressJwt({
    secret: config.secret,
    getToken: function (req) {
        if (req.cookies.auth)
            return req.cookies.auth;
        return null;
    }
}));
app.use('/', routes);
app.use('/presenter', presenter);
app.use('/quiz', quizEditor);

// Authentication error handling
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        if (req.path === '/quiz') {
            return res.json({error: 'unauthorized'});
        }
        return res.sendFile(app.get('views') + '/login.html');
    }
    next(err);
});


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


