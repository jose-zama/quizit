'use strict';
(function () {
    var app = angular.module('userLoginApp', ['ngCookies']);

    app.controller('loginController', function ($scope, $http, $cookies) {
        $scope.signIn = function () {
            $http.post('/auth', {email: $scope.username, password: $scope.password})
                    .then(
                            function success(response) {
                                //$window.sessionStorage.token = response.token;
                                $cookies.put('auth', response.data.token, {path: '/'});
                                $cookies.put('username', $scope.username, {path: '/'});
                                location.href = '/';
                            },
                            function error(response) {
                                //delete $window.sessionStorage.token;
                                $cookies.remove('auth');
                                if (response.data) {
                                    $scope.message = response.data;
                                } else {
                                    $scope.message = 'Error: Invalid user or password';
                                }

                            });
        };

        $scope.register = function () {
            $http.post('/auth/register', {email: $scope.username, password: $scope.password})
                    .then(
                            function success(response) {
                                if (response.data.token) {
                                    $cookies.put('auth', response.data.token, {path: '/'});
                                    $cookies.put('username', $scope.username, {path: '/'});
                                    location.href = '/';
                                } else {
                                    $scope.message = response.data.message;
                                }

                            },
                            function error(response) {
                                if (response.data) {
                                    $scope.message = response.data.message;
                                } else {
                                    $scope.message = 'oh no, something went wrong';
                                }

                            });
        };
    });
})();