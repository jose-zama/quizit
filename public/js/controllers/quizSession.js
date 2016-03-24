'use strict';
(function () {
    var app = angular.module('quizSessionApp', ['socketApp'], function ($locationProvider) {
        $locationProvider.html5Mode(true);
    });

    app.controller('questionController', ['$window', 'socket', '$scope', '$location', function ($window, socket, $scope, $location) {
            $scope.title = '';
            $scope.options = [];
            $scope.isAnswerShown = false;

            $scope.buttonLabel = 'Show answer';
            $scope.question = {};

            var socketObj = new socket($location.url());

            var showQuestion = function (question) {
                $scope.question = question;
                $scope.title = question.title;
                $scope.options = [];
                for (var i = 0; i < question.options.length; i++) {
                    $scope.options.push({text: question.options[i], style: ''});
                }
                $scope.isAnswerShown = false;
                //socket.emit('questions:change', question);
            };
            //listeners
            //set current question
            var resultsPage = '.' + $location.url() + '/results';
            socketObj.emit('question:pullCurrent', '', function (question) {
                if (question) {
                    showQuestion(question);
                    //socket.emit('user:send','presenter');
                } else {
                    $window.location.href = resultsPage;
                }
            });

            $scope.showCorrectAnswer = function () {
                $scope.options[$scope.question.answer - 1].style = 'list-group-item-success';
                $scope.isAnswerShown = true;
                socketObj.emit('presenter:showAnswer', $scope.question.answer);
            };

            $scope.next = function () {
                socketObj.emit('questions:next', null, function (question) {
                    if (question) {
                        showQuestion(question);
                    } else {
                        $window.location.href = resultsPage;
                    }

                });
            };

            $scope.$on('$destroy', function (event) {
                socketObj.removeAllListeners(); //Avoid creating another listener 
                //of the other controller
            });

        }]);

})();