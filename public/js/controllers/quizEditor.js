'use strict';
(function () {
    var app = angular.module('quizEditorApp', ['qaServices', 'ui.sortable']);

    app.controller('quizController', function ($scope, Quiz, $routeParams, $location) {
        if ($routeParams.quiz !== undefined) {
            //to edit an existing quiz
            //$scope.title = $routeParams.quiz;

            Quiz.get({id: $routeParams.quiz},
                    function success(response) {
                        if (response.title) {
                            $scope.title = response.title;
                            $scope.questions = response.questions;
                        }
                    },
                    function error(httpResponse) {
                        $scope.error = true;
                        if (httpResponse.status === 400) {
                            $scope.response = "Mmm, it seems the URL is wrong, check it again";
                            $scope.responseStyle = 'alert-warning';
                        }
                        if (httpResponse.status === 403) {
                            $scope.response = "Hey, you don't have access to the requested quiz!";
                            $scope.responseStyle = 'alert-danger';
                        }
                        if (httpResponse.status === 404) {
                            $scope.response = "Hey, the requested quiz doesn't exist!";
                            $scope.responseStyle = 'alert-danger';
                        }
                    }
            );
        } else {
            //to create a new quiz
            $scope.title = '';
            $scope.questions = [];
        }


        $scope.save = function () {
            Quiz.save({id: $scope.title}, {questions: $scope.questions, quizId: $routeParams.quiz}, function (response) {
                if (response.status === 'ok') {
                    //$location.path('/edit/' + response.id);
                    $scope.response = 'Quiz saved successfully!';
                    $scope.responseStyle = 'alert-success';
                    $scope.hideSave = true;
                } else {
                    $scope.response = 'Arrgh, there is an error with your request!';
                    $scope.responseStyle = 'alert-danger';
                }
            });
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