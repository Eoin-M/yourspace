'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('YourhomeController', ['$scope', '$rootScope', '$http', '$uibModal', '$timeout', '$window', 'MeanUser', 'Global', 'Yourhome', 'Module',
  function($scope, $rootScope, $http, $modal, $timeout, $window, MeanUser, Global, Yourhome, Module) {
    $scope.global = Global;
    $scope.package = {
      name: 'yourhome'
    };
	
	$scope.yourLoggedin = false;
	
	$scope.reload = function(){
		$window.location.reload();
	}
	
	$scope.modules = [
		  {
			include: 'rss',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 0
		},
		
		{
			include: 'reddit',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 1
		},
		
		{
			include: 'twitter',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 2
		},
		
		{
			include: 'stocks',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 3
		},
		
		{
			include: 'weather',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 4
		},
		
		{
			include: 'calendar',
			class: "col-lg-3 col-md-4 col-sm-6 col-xs-12",
			visible: true,
			position: 5
		},
		
		{
			include: 'yelp',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 6
		},
		
		{
			include: 'jobs',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 7
		},
		
		{
			include: 'instagram',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 8
		},
		
		{
			include: 'email',
			class: 'col-lg-6 col-md-8 col-sm-6 col-xs-12',
			visible: true,
			position: 9
		},
		
		{
			include: 'search',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 10
		}
	  ];
	  
	  Module.modObj = {modArray: $scope.modules};
	  
	  $rootScope.$on('moduleUpdate', function(){
		  //$scope.modules = Module.modObj.modArray;
		  for(var i = 0; i < $scope.modules.length; i++){
			  $scope.modules[i].visible = Module.modObj.modArray[i].visible;
		  }
		  saveTheModules();
	  });
	  
	  $scope.removeModule = function(id){
		  for(var i = 0; i < $scope.modules.length; i++){
			  if(id == $scope.modules[i].include) {
				  $scope.modules[i].visible = false;
				  Module.modObj = {modArray: $scope.modules};
				  $scope.$apply();
				  $rootScope.$emit('moduleRemove');
				  saveTheModules();
				  return;
			  }
		  }
	  }
	  
	  if(MeanUser && MeanUser.user) {
		  if(!MeanUser.user.name) MeanUser.user = undefined;
		}
	  
	  if(MeanUser && MeanUser.user){
			$scope.yourLoggedin = true;
			$scope.modules = MeanUser.user.modules;
			console.dir(MeanUser.user);
		}
	
	$rootScope.$on('loggedin', function() {
		$scope.yourLoggedin = true;
		$scope.modules = MeanUser.user.modules;
		Module.modObj = {modArray: $scope.modules};
		$rootScope.$emit('reModule');
		if(MeanUser.user.snag) {
			console.dir(MeanUser);
			$scope.module = MeanUser.user.modules;
			
			$scope.user = MeanUser.user.snag;
			
			$timeout(function() {
				$scope.modalInstance = $modal.open({
				  templateUrl: '/yourhome/views/snagModal.html',
				  controller: function($scope){
					$scope.cancel = function() {
						$scope.modalInstance.dismiss('cancel');
					}
					
					$scope.link = function(){
						$http.get('/api/yourhome/snagLink')
						.success(function(){
							$scope.reload();
						});
						$scope.cancel();
					}
					  
					$scope.modalInstance.result.finally(function(){
						$http.get('/api/yourhome/deSnag');
					});
				  },
				  scope: $scope
				});
				
			}, 500);
		}
		});
		
		$scope.saveModules = function(sortOrder){
			if(!$scope.yourLoggedin) return;
			//console.log(sortOrder);
			for(var i = 0; i < ($scope.modules).length; i ++){
				$scope.modules[i].position = sortOrder.indexOf($scope.modules[i].include);
			}
			console.dir($scope.modules);
			saveTheModules();
		}
		
		function saveTheModules(){
			$http.post('/api/yourhome/saveModules', {modules: $scope.modules})
			.success(function(data){
			})
			.error(function(data){
			});
		}
		
		$scope.emitLocation = function(){
			$scope.saveLocation();
			$rootScope.$emit('loc');
		}
		
		$scope.saveLocation = function(){
			if(!$scope.yourLoggedin) return;
			
			$http.post('/api/yourhome/saveLocation', {loc: loc});
		}
		
		$scope.getLocation = function(){
			$http.get('/api/yourhome/getLocation')
			.success(function(data){
				loc = data.loc;
				$rootScope.$emit('loc');
			})
			.error(function(data){
				$rootScope.$emit('noLoc');
			});
		}
    }
]);