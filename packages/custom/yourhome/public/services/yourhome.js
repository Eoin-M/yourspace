'use strict';

angular.module('mean.yourhome').factory('Yourhome', [
  function() {
    return {
      name: 'yourhome'
    };
  }
]);

angular.module('mean.yourhome').service('Module', function () {
        this.modObj = {};
});