'use strict';
(function () {
    var app = angular.module('quizEditorApp', ['qaServices', 'ui.sortable']);

    app.controller('quizController', function (Quiz, $routeParams, $location) {
        var quiz = this;
        if($routeParams.quiz !== undefined){
            //to edit an existing quiz
            quiz.title = $routeParams.quiz;
            quiz.questions = Quiz.get({id: $routeParams.quiz});
        }else{
            //to create a new quiz
            quiz.title = '';
            quiz.questions = [];
        }
        
        
        this.save = function () {
            Quiz.save({id: quiz.title}, {questions: quiz.questions, oldTitle: $routeParams.quiz});
            $location.path('/edit/'+quiz.title);
            //$location = '.' + $location.url() + '/' + quiz.title;
        };

        this.addQuestion = function () {
            var q = {
                title: "",
                answer: 1,
                options: ["", "", "", ""]
            };
            quiz.questions.push(q);
        };

        this.removeQuestion = function (questionIndex) {
            quiz.questions.splice(questionIndex, 1);
        };
    });
})();