var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

/* GET attendant listing. */
router.get('/*', function (req, res, next) {
    res.sendFile(viewsPath + '/answer-panel.html');
});

module.exports = router;
