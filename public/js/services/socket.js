'use strict';
(function () {
    var app = angular.module('socketApp', []);
    app.service('socket', function ($rootScope) {
        //var socket = io.connect('/htmlQuiz');
        var socket;
        function soc(namespace) {
            //socket = io(location.host+'/'+namespace);
            console.log(location.host+namespace);
            socket = io(location.host+namespace);
        }
        ;
        soc.prototype.on = function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        };
        soc.prototype.emit = function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        };
        soc.prototype.removeAllListeners = function () {
            console.log('really destroying listeners');
            socket.removeAllListeners();
        };
        return soc;
    });
})();