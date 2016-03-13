var fs = require('fs');
var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

// RESTful app for CRUD operations of questions
//https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular

var questions;


router.get('/', function (req, res, next) {
    fs.readdir('./models/', function(err, files){
        if (err)
            throw err;
        else {
            files = files.map(function(name){
                return name.slice(0,name.lastIndexOf('.'));
            });
            res.json(files); 
        }
    });
});

router.get('/:id', function (req, res, next) {
    fs.readFile('./models/'+req.params.id+'.json', function (err, data) {
        if (err)
            throw err;
        else {
            questions = JSON.parse(data);
            console.log("JSON read :");
            console.log(questions);//checar como llega el json
            res.json(questions); 
        }
    });
});

router.post('/:id', function (req, res, next) {
    questions = req.body;
    console.log("JSON to save :");
    console.log(req.body);//checar como llega el json
    fs.writeFile('./models/'+req.params.id+'.json', JSON.stringify(questions, null, 4), function (err) {
        if (err)
            throw err;
        else {
            //res.json(req.body);
            //Todo: return true;
        }

    });
});

module.exports = router;
