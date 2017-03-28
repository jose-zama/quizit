'use strict';
(function () {
    angular.module('dashboardApp', ['ngRoute', 'qaServices', 'quizEditorApp', 'ngCookies', 'ng-showdown'])

            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                    $routeProvider.
                            when('/', {
                                controller: 'dashboardHomeController as home',
                                templateUrl: '/partials/dashboard/home.html'
                            }).
                            when('/create', {
                                controller: 'quizController',
                                templateUrl: '/partials/dashboard/quizEditor.html'
                            }).
                            when('/edit/:quiz', {
                                controller: 'quizController',
                                templateUrl: '/partials/dashboard/quizEditor.html'
                            }).
                            when('/run/:quiz', {
                                controller: 'runningQuizController',
                                templateUrl: '/partials/dashboard/quizRun.html'
                            }).
                            when('/delete/:quiz', {
                                controller: 'deleteQuizController',
                                templateUrl: '/partials/dashboard/quizDelete.html'
                            }).
                            otherwise({
                                redirectTo: '/'
                            });
                    $locationProvider
                            .html5Mode(true);
                }])

            .config(function ($showdownProvider) {
                $showdownProvider.setOption('tables', true);
            })

            .controller('dashboardController', function ($scope, $cookies) {
                $scope.username = $cookies.get('username');
                $scope.qlModal = false;
                $scope.showQl = function () {
                    $scope.qlModal = true;
                };
                $scope.logout = function () {
                    $cookies.remove('auth');
                    $cookies.remove('username');
                    location.href = '/';
                };
            })

            .controller('dashboardHomeController', function () {
            })

            .controller('runningQuizController', function ($routeParams, $scope, QuizSession) {
                $scope.quiz = $routeParams.quiz;

                var startQuiz = function () {
                    var response;
                    QuizSession.run({id: $routeParams.quiz}, function (data) {
                        response = data.status;
                        switch (response) {
                            case "created":
                                $scope.response = 'The quiz has started!';
                                $scope.responseStyle = 'alert-success';
                                break;
                            case 'running':
                                $scope.response = 'The quiz is already running!';
                                $scope.responseStyle = 'alert-warning';
                                break;
                            default:
                                $scope.response = response;
                                $scope.responseStyle = 'alert-danger';
                                return;
                        }
                        $scope.title = data.title;
                        $scope.sessionName = data.sessionName;
                        $scope.serverLink = './presenter/' + $scope.sessionName;
                        $scope.clientLink = location.protocol + '//' + location.host + '/answer/' + $scope.sessionName;
                        $scope.running = 'running';
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
                            });
                };

                startQuiz();


                $scope.startQuiz = function () {
                    startQuiz();
                };


                $scope.stopQuiz = function () {
                    QuizSession.stop({id: $scope.sessionName}, function (data) {
                        switch (data.status) {
                            case 'ok':
                                $scope.response = "The quiz has been terminated!";
                                $scope.responseStyle = 'alert-info';
                                break;
                            case 'missing':
                                $scope.response = "The quiz was not running anymore!";
                                $scope.responseStyle = 'alert-warning';
                                break;
                            default:
                                $scope.response = data.status;
                                $scope.responseStyle = 'alert-danger';
                                break;
                        }
                        $scope.running = '';
                    });
                };

            })

            .controller('deleteQuizController', function ($routeParams, $scope, Quiz) {
                $scope.quiz = $routeParams.quiz;

                Quiz.get({id: $routeParams.quiz},
                        function success(response) {
                            if (response.title) {
                                $scope.title = response.title;
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

                $scope.deleteQuiz = function () {
                    Quiz.remove({id: $scope.quiz}, function (data) {
                        switch (data.status) {
                            case 'ok':
                                $scope.response = "The quiz has been deleted";
                                $scope.responseStyle = 'alert-success';
                                break;
                            case 'missing':
                                $scope.response = "The quiz does not exist.";
                                $scope.responseStyle = 'alert-info';
                                break;
                            default:
                                $scope.response = data.status;
                                $scope.responseStyle = 'alert-danger';
                                break;
                        }
                    });
                };
            })

            .directive('focusMe', function ($timeout, $parse) {
                return {
                    //scope: true,   // optionally create a child scope
                    link: function (scope, element, attrs) {
                        var model = $parse(attrs.focusMe);
                        scope.$watch(model, function (value) {
                            if (value === true) {
                                $timeout(function () {
                                    element[0].focus();
                                });
                            }
                        });
                        // on blur event:
                        element.bind('blur', function () {
                            scope.$apply(model.assign(scope, false));
                        });
                    }
                };
            })

            .directive('qlModal', function (Quiz, $timeout) {
                return{
                    restrict: 'E',
                    transclude: true,
                    scope: true,
                    link: function (scope, element, attrs) {
                        scope.quizzes = Quiz.query();

                        scope.closeModal = function () {
                            element.modal('hide');
                        };

                        scope.$watch(attrs.visible, function (value) {
                            if (value === true) {
                                Quiz.query(function success(res) {
                                    if (res.error) {
                                        location.href = '/';
                                    } else {
                                        scope.quizzes = res.quizzes;
                                        element.modal('show');
                                    }
                                }
                                );
                            } else
                                element.modal('hide');
                        });

                        element.on('hidden.bs.modal', function () {
                            $timeout(function () {
                                scope.$apply(function () {
                                    scope.$parent[attrs.visible] = false;
                                });
                            }, 0, false);

                        });

                        scope.$on('$destroy', function () {
                            //element.remove(); i dont know if it is necessary
                        });
                    },
                    templateUrl: '/partials/modals/quizList.html'
                };
            });

})();