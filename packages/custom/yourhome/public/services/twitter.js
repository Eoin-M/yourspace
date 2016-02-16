'use strict';

angular.module('mean.yourhome').factory('socket', ['$rootScope',
  function($rootScope) {
	var socket = io.connect('http://danu7.it.nuigalway.ie:8620');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }
    };
  }
]);