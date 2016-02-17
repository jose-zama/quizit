var questionServices = angular.module('qaServices', ['ngResource']);

questionServices.factory('Question', ['$resource',
    function ($resource) {
        return $resource('edit', {}, {
            //query: {method: 'GET', params: {quizId: 'get'}, isArray: true}
            saveAll: {method: 'POST'}
        });
    }]);