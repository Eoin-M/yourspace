'use strict';

angular.module('mean.yourhome').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('yourhome example page', {
      url: '/yourhome/example',
      templateUrl: 'yourhome/views/index.html'
    });
  }
]);

angular.module('mean.yourhome')
.config(['$viewPathProvider', function($viewPathProvider) {
	$viewPathProvider.override('system/views/index.html', 'yourhome/views/index.html');
}]);