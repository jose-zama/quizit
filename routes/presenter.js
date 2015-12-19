var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

/* GET questions. */
router.get('/questions', function (req, res, next) {
    res.sendFile(viewsPath + '/question.html');
});

/* GET results. */
router.get('/results', function (req, res, next) {
    //res.render(viewsPath + '/results', {results:'these are the results: '+ req.score});
    res.render(viewsPath + '/results', {results:req.students});
});

module.exports = router;
