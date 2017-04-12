'use strict';
(function () {
    var app = angular.module('quizClientApp', ['socketApp', 'ngRoute', 'ngCookies', 'ng-showdown']);

    app.config(function ($showdownProvider) {
        $showdownProvider.setOption('tables', true);
    });

    app.value('userDetails', {username: undefined, score: undefined, totalQuestions: undefined});

    app.factory('socketObj', function ($routeParams, socket) {
        return new socket('/' + $routeParams.quizID);
    });

    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider.
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

    app.controller('logonCtrl', function ($scope, $location, socketObj, $routeParams, $cookies, userDetails) {


        $scope.setUser = function (username) {
            socketObj.emit('user:login', username, function (isTaken) {
                console.log(isTaken);
                if (isTaken) {
                    $scope.alert = username + ' is already taken, enter another one';
                } else {
                    userDetails.username = username;
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

    app.controller('answersPanelController', function ($scope, $location, $timeout, $routeParams, socketObj, $cookies, userDetails) {

        $scope.changeQuestion = function (question) {
            $scope.selectedAnswer = null;
            $scope.question = question.title;
            $scope.options = [];
            for (var i = 0; i < question.options.length; i++) {
                $scope.options.push({text: question.options[i], style: 'btn-primary'});
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
                        userDetails.username = username;
                        socketObj.emit('question:pullCurrent', '', function (currentQuestion) {
                            if (currentQuestion) {
                                $scope.changeQuestion(currentQuestion);//pull current question
                            }
                        });
                    }
                });

            }
        }, 0);

        //event fires when presenter changes the question
        socketObj.on('questions:change', function (question) {
            if (question) {
                $scope.changeQuestion(question);
            } else {
                //TODO: check status of questions (about to start or finished) and
                //route accordingly
                socketObj.emit('student:getScore', userDetails.username, function (score, totalQuestions) {
                    userDetails.score = score;
                    userDetails.totalQuestions = totalQuestions;
                    var path = window.location.pathname;
                    $cookies.remove('username', {path: path});
                    $location.path('/result');
                });
            }
        });

        socketObj.on('showAnswer', function (answer) {
            /*var audio = document.createElement('successTone');
             audio.src = getPhoneGapPath()+'/audio/wrong.wav';
             audio.play();*/
            if (($scope.selectedAnswer || $scope.selectedAnswer === 0)
                    && $scope.selectedAnswer !== answer - 1) {//-1 is because answerAnswer is not 0-based index
                $scope.options[$scope.selectedAnswer].style = 'btn-danger';
            }
            $scope.options[answer - 1].style = 'btn-success';
            socketObj.emit('student:score', $scope.selectedAnswer);
        });

        $scope.selectAnswer = function (answer) {
            $scope.selectedAnswer = answer;
        };

        $scope.isActive = function (answer) {
            return answer === $scope.selectedAnswer;
        };

        $scope.$on('$destroy', function (event) {
            socketObj.removeAllListeners();
        });
    });

    app.controller('resultCtrl', function ($scope, $location, socketObj, userDetails) {

        $scope.score = userDetails.score;
        $scope.totalQuestions = userDetails.totalQuestions;
        $scope.username = userDetails.username;

        if ($scope.score === undefined) {
            $location.path('/error');
        }

        $scope.$on('$destroy', function (event) {
            socketObj.removeAllListeners(); //Avoid creating another listener 
            //of the other controller
        });
    });


})();