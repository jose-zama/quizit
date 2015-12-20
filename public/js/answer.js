(function () {
    var app = angular.module('answerApp', ['socketApp', 'ngRoute']);

    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $routeProvider.
                    when('/answer', {
                        controller: 'answersPanelController as panel',
                        templateUrl: '/partials/answer.html'
                    }).
                    when('/user', {
                        controller: 'logonCtrl as logon',
                        templateUrl: '/partials/logon.html'
                    }).
                    otherwise({
                        redirectTo: '/user'
                    });
            $locationProvider
                    .html5Mode(true);
        }]);

    app.controller('logonCtrl', function ($scope, $location, socket) {
        ctrl = this;

        ctrl.setUser = function (username) {
            socket.emit('user:login', username, function (isTaken) {
                console.log(isTaken);
                if (isTaken) {
                    //stay and show a message
                } else {
                    _username = username;
                    $location.path('/answer');
                }
            });
        };

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners(); //Avoid creating another listener 
            //of the other controller
            // 
            // or something like
            // socket.removeListener(this);
        });
    });

    var currentQuestion;
    var _username;

    app.controller('answersPanelController', function ($scope, $location, $timeout, socket) {

        panel = this;

        panel.changeQuestion = function (question) {
            currentQuestion = question;
            panel.selectedAnswer = null;
            panel.question = question.title;
            panel.options = [];
            for (var i = 0; i < question.options.length; i++) {
                panel.options.push({text: question.options[i], style: 'btn-primary'});
            }
        };


        //init
        $timeout(function () {
            if (!_username) {
                $location.path('/user');
            } else {
                socket.emit('question:pullCurrent', '', function (currentQuestion) {
                    console.log(currentQuestion.title);
                    if (currentQuestion) {
                        panel.changeQuestion(currentQuestion);//pull current question
                    }
                });
            }
        }, 0);


        //listeners
        ////init with current question
        socket.on('questions:init', function (question) {
            console.log(question.title);
            panel.changeQuestion(question);
            //socket.emit('user:send', 'Anita');
        });

        //event fires when presenter changes the question
        socket.on('questions:change', function (question) {
            panel.changeQuestion(question);
        });

        socket.on('showAnswer', function (answerAnswer) {
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
            socket.emit('student:score', panel.selectedAnswer);
        });

        panel.selectAnswer = function (answer) {
            panel.selectedAnswer = answer;
        };

        panel.isActive = function (answer) {
            return answer === panel.selectedAnswer;
        };

        panel.submitAnswer = function () {
            socket.emit('answer', panel.selectedAnswer);
        };

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
            // or something like
            // socket.removeListener(this);
        });
    });

})();