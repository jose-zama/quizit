'use strict';
(function () {
    var app = angular.module('quizEditorApp', ['qaServices', 'ui.sortable']);

    app.controller('quizController', function ($scope, Quiz, $routeParams, $location) {
        if ($routeParams.quiz !== undefined) {
            //to edit an existing quiz
            $scope.title = $routeParams.quiz;
            $scope.questions = Quiz.get({id: $routeParams.quiz});
        } else {
            //to create a new quiz
            $scope.title = '';
            $scope.questions = [];
        }


        $scope.save = function () {
            Quiz.save({id: $scope.title}, {questions: $scope.questions, oldTitle: $routeParams.quiz});
            $location.path('/edit/' + $scope.title);
            //$location = '.' + $location.url() + '/' + $scope.title;
        };

        $scope.addQuestion = function () {
            var q = {
                title: "",
                answer: 1,
                options: ["", "", "", ""]
            };
            $scope.questions.push(q);
        };

        $scope.removeQuestion = function (questionIndex) {
            $scope.questions.splice(questionIndex, 1);
        };
    });
})();