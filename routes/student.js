var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views') + '/session';

/* GET attendant listing. */
router.get('/:quizName*', function (req, res, next) {
    //quizMap has the relation between paths and quiz id's
    var quizMap = req.app.get('quizMap');

    var quizId = quizMap[req.params.quizName];
    console.log(quizId);
    if (quizId !== undefined) {
        //BORRAR basePath, no esta siendo usado
        res.render(viewsPath + '/answer-panel');
    } else {
        res.render(viewsPath + '/missing', {quiz: req.params.quizName});
    }
    /*
     var quizesRunning = req.app.get('quizesRunning');
     if (quizesRunning[req.params.quizId] !== undefined) {
     res.render(viewsPath + '/answer-panel', {basePath: req.params.quizId});
     }else{
     res.render(viewsPath + '/missing',{quiz:req.params.quizId});
     }
     */
});

module.exports = router;
