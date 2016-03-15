'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('RedditController', ['$scope', '$http', 'Global', 'Yourhome',
  function($scope, $http, Global, Yourhome) {
    $scope.global = Global;
    $scope.package = {
      name: 'yourhome'
    };
	
	$scope.reddit = [];
	$scope.reddit = function(){
		$http.post('/api/yourhome/reddit')
		.success(function(data){
			console.log(data.reddit);
			$scope.reddit = data.reddit.data.children;
		});
	}
	
	$scope.redditUpVote = function(post){
		var dir = 1;
		if(post.likes === true){
			dir = 0;
		}
		$http.post('/api/yourhome/redditVote', JSON.stringify({id: post.name, dir: dir}))
		.success(function(data){
			if(post.likes === true) {
				post.likes = null;
				post.score--;
			}
			else if(post.likes === false){
				post.likes = true;
				post.score += 2;
			}
			else{
				post.likes = true;
				post.score++;
			}
		})
		.error(function(data){
			console.log(data);
		});
	}
	
	$scope.redditDownVote = function(post){
		var dir = -1;
		if(post.likes === false){
			dir = 0;
		}
		$http.post('/api/yourhome/redditVote', JSON.stringify({id: post.name, dir: dir}))
		.success(function(data){
			if(post.likes === false){
				post.likes = null;
				post.score++;
			}
			else if(post.likes === true){
				post.likes = false;
				post.score -= 2;
			}
			else{
				post.likes = false;
				post.score--;
			}
		})
		.error(function(data){
			console.log(data);
		});
	}
  }
]);