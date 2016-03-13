(function () {
    angular.module('dashboardApp', ['ngRoute', 'qaServices', 'quizEditorApp'])

            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                    $routeProvider.
                            when('/', {
                                controller: 'dashboardHomeController as home',
                                templateUrl: '/partials/dashboard/home.html'
                            }).
                            when('/edit/:quiz', {
                                controller: 'quizController as quiz',
                                templateUrl: '/partials/dashboard/quizEditor.html'
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
                    console.log(true);
                    $scope.qlModal = true;
                };
            })

            .controller('dashboardHomeController', function () {
            })


            .directive('qlModal', function (Quiz) {
                return{
                    restrict : 'E',
                    transclude: true,
                    scope:true,
                    link: function (scope, element, attrs) {
                        scope.quizzes = Quiz.query();
                        console.log(scope.quizzes);
                        
                        scope.closeModal = function () {
                            element.modal('hide');
                        };

                        scope.$watch(attrs.visible, function (value) {
                            if (value === true){
                                scope.quizzes = Quiz.query();
                                element.modal('show');
                            }
                            else
                                element.modal('hide');
                        });

                        element.on('hidden.bs.modal', function () {
                            scope.$apply(function () {
                                scope.$parent[attrs.visible] = false;
                            });
                        });

                        scope.$on('$destroy', function () {
                            element.$destroy();
                        });
                    },
                    templateUrl: '/partials/modals/quizList.html'
                };
            });

})();