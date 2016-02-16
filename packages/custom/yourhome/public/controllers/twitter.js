'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('TwitterController', ['$scope', '$http', 'Global', 'Yourhome', 'socket',
  function($scope, $http, Global, Yourhome, socket) {
    $scope.global = Global;
	var tweets = [];
	
	$scope.openTwitterStream = function(){
		$http.post('/api/yourhome/twitterFeed');
	}
	
	socket.on('tweets', function (data) {
		console.dir(data);
		tweets[tweets.length] = data;
		$scope.tweets = tweets;
	});
  }
]);