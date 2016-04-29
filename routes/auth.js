var express = require('express');
var users = require('../model/users');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

router.get('/', function (req, res, next) {
    res.sendFile(viewsPath + '/login.html');
});

router.post('/', function (req, res, next) {
    users.login(req.body.email, req.body.password, function (err, token) {
        if (err) {
            res.status(401).send(err.message);
            return;
        }
        res.json({token: token});
    });
});

router.post('/register', function (req, res, next) {
    users.register(req.body.email, req.body.password, function (err, token) {
        if (err) {
            if (err.code === 11000) {
                res.json({message: "Email already taken"});
                return;
            }
            res.status(500).send(err.message);
            return;
        }
        res.json({token: token});
    });
});

module.exports = router;
