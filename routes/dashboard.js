var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

router.get('/', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

router.get('/create', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

router.get('/edit/*', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

router.get('/run/*', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

router.get('/delete/*', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

module.exports = router;
