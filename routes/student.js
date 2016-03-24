var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views')+'/session';

/* GET attendant listing. */
router.get('/:quizId*', function (req, res, next) {
    var quizesRunning = req.app.get('quizesRunning');
    if (quizesRunning[req.params.quizId] !== undefined) {
        res.render(viewsPath + '/answer-panel', {basePath: req.params.quizId});
    }else{
        res.render(viewsPath + '/missing',{quiz:req.params.quizId});
    }
});

module.exports = router;
