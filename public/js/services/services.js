var questionServices = angular.module('qaServices', ['ngResource']);

questionServices.factory('Quiz', ['$resource',
    function ($resource) {
        return $resource('quiz/:id', {id: '@id'}, {
            run: {method: 'POST'},
            query: {method: 'GET', transformResponse: function (data, headersGetter) {
                    var res = angular.fromJson(data);
                    if (res.error === 'unauthorized') {
                        return {error:'unauthorized'};
                    }
                    return {quizzes: res};
                }}
        });
    }]);

questionServices.factory('QuizSession', ['$resource',
    function ($resource) {
        return $resource('presenter/:id', {id: '@id'}, {
            run: {method: 'POST'},
            stop: {method: 'DELETE'}
        });
    }]);

