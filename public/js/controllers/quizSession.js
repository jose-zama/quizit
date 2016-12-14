'use strict';
(function () {
    var app = angular.module('quizSessionApp', ['socketApp', 'timer', 'ngAudio'], function ($locationProvider) {
        $locationProvider.html5Mode(true);
    });

    app.controller('questionController', ['$window', 'socket', '$scope', '$location', '$timeout', 'ngAudio', function ($window, socket, $scope, $location, $timeout, ngAudio) {
            $scope.title = '';
            $scope.options = [];
            $scope.isAnswerShown = false;

            $scope.buttonLabel = 'Show answer';
            $scope.question = {};

            var socketObj = new socket($location.url());
            var answersPrefixes = ['A. ', 'B. ', 'C. ', 'D. '];
            $scope.initialCountdown = 32;
            $scope.progress = 0;

            //sound
            $scope.countdownSound = ngAudio.load("/audio/10_sec_to_gong.mp3");

            var showQuestion = function (question) {
                $scope.question = question;
                $scope.progress = (question.number/question.totalQuestions)*100;
                $scope.title = question.title;
                $scope.options = [];
                $scope.chart = [];
                for (var i = 0; i < question.options.length; i++) {
                    $scope.options.push({text: answersPrefixes[i] + question.options[i], style: ''});
                    $scope.chart[i] = 0;
                }
                $scope.isAnswerShown = false;
                resetCountdown();
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

            function resetCountdown() {
                $scope.$broadcast('timer-reset');
                $scope.$broadcast('timer-start');
            }
            ;

            $scope.showCorrectAnswer = function () {
                $scope.options[$scope.question.answer - 1].style = 'list-group-item-success';
                $scope.isAnswerShown = true;
                socketObj.emit('presenter:showAnswer', $scope.question.answer);
                $scope.showAnswersChart = true;
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

            $scope.addCDSeconds = function (secs) {
                $scope.$broadcast('timer-add-cd-seconds', secs);
                $scope.countdownSound.restart();
            };

            $scope.$on('timer-tick', function (event, args) {
                var initialCountDownOn = 10 * 1000;
                $scope.dangerZone = args.millis <= initialCountDownOn;

                $timeout(function () {
                    if (args.millis === initialCountDownOn+1000) {
                        $scope.countdownSound.play();
                    }
                    $scope.$apply();
                });
            });


            $scope.countdownFinished = function () {
                $scope.showCorrectAnswer();
                $scope.$apply();
            };



            socketObj.on('questions:studentAnswer', function (answer) {
                $scope.chart[answer]++;
            });

            $scope.$on('$destroy', function (event) {
                socketObj.removeAllListeners(); //Avoid creating another listener 
                //of the other controller
            });

        }]);

})();