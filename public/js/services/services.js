var questionServices = angular.module('qaServices', ['ngResource']);

questionServices.factory('Quiz', ['$resource',
    function ($resource) {
        return $resource('quiz/:id', {id: '@id'}, {
            get: {method: 'GET', isArray: true}
        });
    }]);
