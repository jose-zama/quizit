'use strict';
(function () {
    angular.module('dashboardApp', ['ngRoute', 'qaServices', 'quizEditorApp'])

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

            .controller('dashboardController', function ($scope) {
                $scope.qlModal = false;
                $scope.showQl = function () {
                    $scope.qlModal = true;
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
                        $scope.serverLink = './presenter/' + $routeParams.quiz;
                        $scope.clientLink = location.protocol + '//' + location.host + '/answer/' + $routeParams.quiz;
                        $scope.running = 'running';
                    });
                };

                startQuiz();


                $scope.startQuiz = function () {
                    startQuiz();
                };


                $scope.stopQuiz = function () {
                    QuizSession.stop({id: $scope.quiz}, function (data) {
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

            .directive('qlModal', function (Quiz,$timeout) {
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
                                scope.quizzes = Quiz.query();
                                element.modal('show');
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