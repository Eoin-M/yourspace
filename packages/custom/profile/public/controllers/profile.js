'use strict';

angular.module('mean.profile').controller('ProfileController', ['$scope', '$rootScope', '$http', '$window', 'MeanUser', 'Global', 'Profile',
  function($scope, $rootScope, $http, $window, MeanUser, Global, Profile) {
    $scope.global = Global;
    $scope.package = {
      name: 'profile'
    };
	$scope.profile = {};
	
	$scope.defaultIMG = '/theme/assets/img/pineapple.png';
	$scope.socialButtonsCounter = 0;

	$http.get('/api/get-config')
	.success(function(config) {
	  if(config.hasOwnProperty('local')) delete config.local; // Only non-local passport strategies
	  $scope.socialButtons = config;
	  $scope.socialButtonsCounter = Object.keys(config).length;
	});
	
	if(MeanUser && MeanUser.user && MeanUser.user.name) { //it seems to pass this check if I don't check for a user's name
		$scope.profile = MeanUser.user;
		if($scope.profile.email[0] == '@') $scope.profile.email = '';
	}
	
	$rootScope.$on('loggedin', function() {
		$scope.profile = MeanUser.user;
		if($scope.profile.email[0] == '@') $scope.profile.email = '';
    });
	
	$scope.saveProfile = function(){
		$http.post('/api/profile/save', {user: $scope.profile})
		.success(function(data){
		})
		.error(function(data){
		});
	}
	
	$scope.removeAccount = function(provider){
		$scope.profile[provider] = null;
		var index = $scope.profile.providers.indexOf(provider);
		if(index >= 0) $scope.profile.providers.splice(index, 1);
		console.dir(MeanUser.user);
	}
	
	$scope.changeProfilePic = function(src){
		$scope.profile.imgsrc = src;
	}
	
	$scope.cancelProfile = function(){
		$window.location.reload();
	}
	
	$scope.deleteProfile = function(){
		$http.post('/api/profile/delete')
		.success(function(data){
			MeanUser.logout();
		})
		.error(function(data){
			MeanUser.logout();
		});
	}
  }
]);
