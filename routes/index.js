var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile( viewsPath + '/index.html');
});

router.get('/edit/*', function(req, res, next) {
  res.sendFile( viewsPath + '/index.html');
});

module.exports = router;
