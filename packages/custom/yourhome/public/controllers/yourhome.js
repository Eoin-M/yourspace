'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('YourhomeController', ['$scope', '$http', 'Global', 'Yourhome',
  function($scope, $http, Global, Yourhome) {
    $scope.global = Global;
    $scope.package = {
      name: 'yourhome'
    };
  }
]);