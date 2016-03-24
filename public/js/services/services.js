var questionServices = angular.module('qaServices', ['ngResource']);

questionServices.factory('Quiz', ['$resource',
    function ($resource) {
        return $resource('quiz/:id', {id: '@id'}, {
            get: {method: 'GET', isArray: true},
            run: {method: 'POST'}
        });
    }]);

questionServices.factory('QuizSession', ['$resource',
    function ($resource) {
        return $resource('presenter/:id', {id: '@id'}, {
            run: {method: 'POST'},
            stop: {method: 'DELETE'}
        });
    }]);

