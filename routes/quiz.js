'use strict';
var fs = require('fs');
var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

// RESTful app for CRUD operations of questions
//https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular


router.get('/', function (req, res, next) {
    fs.readdir('./models/', function (err, files) {
        if (err)
            throw err;
        else {
            files = files.map(function (name) {
                return name.slice(0, name.lastIndexOf('.'));
            });
            res.json(files);
        }
    });
});

router.get('/:id', function (req, res, next) {
    fs.readFile('./models/' + req.params.id + '.json', function (err, data) {
        if (err)
            throw err;
        else {
            var questions = JSON.parse(data);
            res.json(questions);
        }
    });
});

router.post('/:id', function (req, res, next) {
    var questions = req.body.questions;
    var filename = req.params.id;
    var old = req.body.oldTitle;
    fs.writeFile('./models/' + filename + '.json', JSON.stringify(questions, null, 4), function (err) {
        if (err)
            throw err;
        else {
            //if name was changed, delete old file
            if (old !== undefined && filename !== old) {
                //fs.renameSync('./models/'+req.params.id+'.json','./models/'+req.body.title+'.json');
                fs.unlink('./models/' + old + '.json', function (err) {
                    if (err)
                        throw err;
                });
            }
            res.send('ok');
        }
    });
});

router.delete('/:id', function (req, res, next) {
    var filename = req.params.id;
    fs.unlink('./models/' + filename + '.json', function (err) {
        if (err){
            if (err.code === 'ENOENT') {
                res.json({status: "missing"});
            } else {
                throw err;
            }
        }
        res.json({status: "ok"});
    });
});

module.exports = router;
