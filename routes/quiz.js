var fs = require('fs');
var express = require('express');
var router = express.Router();
var app = express();

var viewsPath = app.get('views');

// RESTful app for CRUD operations of questions
//https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular

var questions;

router.get('/edit', function (req, res, next) {

    fs.readFile('./models/data.json', function (err, data) {
        if (err)
            throw err;
        else {
            questions = JSON.parse(data);
            console.log("JSON read :");
            console.log(questions);//checar como llega el json
            res.json(questions); // return all todos in JSON format
        }
    });

    //questions = require('../models/data.json');
    /*console.log("JSON read :");
    console.log(questions);//checar como llega el json
    res.json(questions); // return all todos in JSON format
    */
});

router.post('/edit', function (req, res, next) {
    questions = req.body;
    console.log("JSON to save :");
    console.log(req.body);//checar como llega el json
    fs.writeFile('./models/data.json', JSON.stringify(questions, null, 4), function (err) {
        if (err)
            throw err;
        else {
            //res.json(req.body);
            //Todo: return true;
        }

    });
    //questions = require('../models/data.json');//reload again
});

/* 
 //Saves first question
 router.post('/edit', function (req, res, next) {
 questions[0] = req.body;
 console.log(req.body);//checar como llega el json
 fs.writeFile('./models/data.json', JSON.stringify(questions, null, 4), function (err) {
 if (err)
 throw err;
 else{
 res.json(req.body);
 }
 
 });
 questions = require('../models/data.json');//reload again
 });
 */
router.get('/*', function (req, res, next) {
    //var questions = require('./models/data.json');
    //res.json(questions); // return all todos in JSON format
    res.sendFile(viewsPath + '/quiz.html');
});


module.exports = router;
