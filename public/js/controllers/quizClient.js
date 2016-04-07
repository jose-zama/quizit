'use strict';
(function () {
    var app = angular.module('quizClientApp', ['socketApp', 'ngRoute', 'ngCookies']);

    var currentQuestion;
    var _username;
    var _score;
    var _questionsTotal;
    //var socketObj;

    app.factory('socketObj', function ($routeParams, socket) {
        return new socket('/' + $routeParams.quizID);
    });

    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider.
                    /*when('/answer', {
                     controller: 'answersPanelController as panel',
                     templateUrl: '/partials/student/answer.html'
                     }).*/
                    when('/error', {
                        template: '<p>mmm... something is wrong. Make sure the URL entered was correct.</p>'
                    }).
                    when('/:quizID/user', {
                        controller: 'logonCtrl as logon',
                        templateUrl: '/partials/student/logon.html'
                    }).
                    when('/result', {
                        controller: 'resultCtrl as result',
                        templateUrl: '/partials/student/result.html'
                    }).
                    when('/:quizID', {
                        controller: 'answersPanelController as panel',
                        templateUrl: '/partials/student/answer.html'
                    }).
                    otherwise({
                        redirectTo: '/error'
                    });
            $locationProvider
                    .html5Mode(true);
        }]);

    app.controller('logonCtrl', function ($scope, $location, socketObj, $routeParams, $cookies) {


        $scope.setUser = function (username) {
            socketObj.emit('user:login', username, function (isTaken) {
                console.log(isTaken);
                if (isTaken) {
                    $scope.alert = username + ' is already taken, enter another one';
                } else {
                    _username = username;
                    var path = window.location.pathname;
                    path = path.slice(0, path.lastIndexOf('/'));
                    $cookies.put('username', username, {path: path});
                    $location.path($routeParams.quizID);
                }
            });
        };

        $scope.$on('$destroy', function (event) {
            socketObj.removeAllListeners(); //Avoid creating another listener 
            //of the other controller
        });
    });

    app.controller('answersPanelController', function ($scope, $location, $timeout, $routeParams, socketObj, $cookies) {

        var panel = this;

        panel.changeQuestion = function (question) {
            currentQuestion = question;
            panel.selectedAnswer = null;
            panel.question = question.title;
            panel.options = [];
            for (var i = 0; i < question.options.length; i++) {
                panel.options.push({text: question.options[i], style: 'btn-primary'});
            }
        };

        //init, when page loads
        $timeout(function () {
            var username = $cookies.get('username');
            console.log(username);
            if (username === undefined) {
                $location.path($routeParams.quizID + '/user');
            } else {
                socketObj.emit('user:isRegistered', username, function (isRegistered) {
                    //if is not registered then discard cookie and route to 
                    //login. This case happens when a cookie from a previous quiz
                    //was not deleted for some reason

                    if (!isRegistered) {
                        var path = window.location.pathname;
                        $cookies.remove('username', {path: path});
                        $location.path($routeParams.quizID + '/user');
                    } else {
                        _username = username;
                        socketObj.emit('question:pullCurrent', '', function (currentQuestion) {
                            if (currentQuestion) {
                                panel.changeQuestion(currentQuestion);//pull current question
                            }
                        });
                    }
                });

            }
        }, 0);

        //event fires when presenter changes the question
        socketObj.on('questions:change', function (question) {
            if (question) {
                panel.changeQuestion(question);
            } else {
                //TODO: check status of questions (about to start or finished) and
                //route accordingly
                socketObj.emit('student:getScore', _username, function (score, questionsTotal) {
                    _score = score;
                    _questionsTotal = questionsTotal;
                    var path = window.location.pathname;
                    $cookies.remove('username', {path: path});
                    $location.path('/result');
                });
            }
        });

        socketObj.on('showAnswer', function (answerAnswer) {
            /*var audio = document.createElement('successTone');
             audio.src = getPhoneGapPath()+'/audio/wrong.wav';
             audio.play();*/
            if (panel.selectedAnswer || panel.selectedAnswer === 0) {
                if (panel.selectedAnswer === answerAnswer - 1) {//-1 is because answerAnswer is not 0-based index
                } else {

                    panel.options[panel.selectedAnswer].style = 'btn-danger';
                }
            }
            panel.options[answerAnswer - 1].style = 'btn-success';
            socketObj.emit('student:score', panel.selectedAnswer);
        });
        /*
         socketObj.on('disconnect', function () {
         var path = window.location.pathname;
         console.log(path);
         $cookies.remove('username', {path: path});
         });
         */
        panel.selectAnswer = function (answer) {
            panel.selectedAnswer = answer;
        };

        panel.isActive = function (answer) {
            return answer === panel.selectedAnswer;
        };

        panel.submitAnswer = function () {
            socketObj.emit('answer', panel.selectedAnswer);
        };

        $scope.$on('$destroy', function (event) {
            socketObj.removeAllListeners();
        });
    });

    app.controller('resultCtrl', function ($scope, $location, socketObj) {
        var result = this;

        result.score = _score;
        result.questionsTotal = _questionsTotal;
        result.username = _username;

        if (_score === undefined) {
            $location.path('/error');
        }

        $scope.$on('$destroy', function (event) {
            socketObj.removeAllListeners(); //Avoid creating another listener 
            //of the other controller
        });
    });


})();