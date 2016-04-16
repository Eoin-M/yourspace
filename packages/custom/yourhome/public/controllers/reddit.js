'use strict';

angular.module('mean.yourhome').controller('RedditController', ['$scope', '$rootScope', '$http', 'MeanUser', 'Global', 'Yourhome',
  function($scope, $rootScope, $http, MeanUser, Global, Yourhome) {
    $scope.global = Global;
    $scope.package = {
      name: 'yourhome'
    };
	
	$scope.reddit = [];
	$scope.r = {};
	$scope.r.search = '/r/';
	$scope.r.loggedIn = false;
	$scope.r.curr = '';
	$scope.r.hotOrNot = '/hot';
	$scope.subreddits;
	
	$scope.redditLoggedin = 'Log in with';
	
	$scope.setReddit = function(rUrl){
		$('.redditTopHighlight').removeClass('redditTopHighlight');
		$('#rHot').addClass('redditTopHighlight');
		$scope.r.curr = rUrl;
		$scope.r.hotOrNot = '/hot';
		$scope.getReddit(rUrl);
	}
	
	$scope.getReddit = function(rUrl){
		console.log(rUrl);
		var urlSplit = rUrl.split('+');
		rUrl = urlSplit[0];
		var t = urlSplit[1];
		$("#redditBody").fadeTo(100,0.5);
		$("#redditLoading").removeClass("hidden");
		$http.post('/api/yourhome/reddit', {rUrl: rUrl, t: t})
		.success(function(data){
			console.log(data.reddit);
			$scope.reddit = data.reddit.data.children;
			$("#redditLoading").addClass("hidden");
			$("#redditBody").fadeTo(100,1);
			if($scope.r.loggedIn && $scope.subreddits === undefined) $scope.getSubreddits();
		})
		.error(function(data, status){
			console.log(status);			
			$("#redditLoading").addClass("hidden");
			$("#redditBody").fadeTo(100,1);
		});
	}
	
	$scope.getMoreReddit = function(){
		if($scope.reddit.length > 0) var after = $scope.reddit[$scope.reddit.length-1].data.name;
		else var after = null;
		var rUrl = $scope.r.curr + $scope.r.hotOrNot;
		console.log(rUrl);
		$http.post('/api/yourhome/reddit', {rUrl: rUrl, after: after})
		.success(function(data){
			console.log(data.reddit);
			$scope.reddit = $scope.reddit.concat(data.reddit.data.children);
		})
		.error(function(data, status){
			console.log(status);
		});
	}
	
	$scope.getSubreddits = function() {
		$http.post('/api/yourhome/reddit', {rUrl: '/subreddits/mine/subscriber'})
		.success(function(data){
			console.log(data.reddit);
			$scope.subreddits = data.reddit.data.children;
		})
		.error(function(data, status){
			console.log(status);
		});
	}
	
	$scope.hideReddit = function(name){
		var index = redditIndexOf(name)
		$scope.reddit.splice(index, 1);
		
		$http.post('/api/yourhome/redditHideOrSave', {rUrl: '/api/hide', id: name})
		.success(function(data){
			console.log(data.reddit);
		})
		.error(function(data, status){
			console.log(status);
		});
	}
	
	$scope.saveReddit = function(post){
		console.log(post.saved);
		if(post.saved) {
			post.saved = false;
			$http.post('/api/yourhome/redditHideOrSave', {rUrl: '/api/unsave', id: post.name});
		}
		else {
			post.saved = true;
			$http.post('/api/yourhome/redditHideOrSave', {rUrl: '/api/save', id: post.name})
		}
	}
	
	function redditIndexOf(name){
		for(var i = 0; i < $scope.reddit.length; i++){
			if(name == $scope.reddit[i].data.name) return i;
		}
		
		return -1;
	}
	
	$scope.redditUpVote = function(post){
		var dir = 1;
		if(post.likes === true){
			dir = 0;
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
		$http.post('/api/yourhome/redditVote', {id: post.name, dir: dir})
		.success(function(data){
		})
		.error(function(data){
			console.log(data);
		});
	}
	
	$scope.redditDownVote = function(post){
		var dir = -1;
		if(post.likes === false){
			dir = 0;
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
		$http.post('/api/yourhome/redditVote', {id: post.name, dir: dir})
		.success(function(data){
		})
		.error(function(data){
			console.log(data);
		});
	}
	
	if(MeanUser && MeanUser.user){
		$scope.r.loggedIn = (MeanUser.user.reddit) ? true : false;
		
		if(MeanUser.user.reddit) {
			$scope.redditLoggedin = undefined;
		}
		else if(MeanUser.user) $scope.redditLoggedin = 'Link';
	}
	
	$rootScope.$on('loggedin', function() {
		$scope.r.loggedIn = (MeanUser.user.reddit) ? true : false;
		
		if(MeanUser.user.reddit) {
			$scope.redditLoggedin = undefined;
		}
		else if(MeanUser.user) $scope.redditLoggedin = 'Link';
		
    });
	
	$rootScope.$on('logout', function() {
		$scope.redditLoggedin = 'Log In With';
		$scope.r.loggedIn = false;
		$scope.setReddit('/hot');
		$scope.r.curr = '';
		$scope.r.hotOrNot = '/hot';
    });
  }
]);

//$(document).ready(function() {
	function redditTop(id){
		$('.redditTopHighlight').removeClass('redditTopHighlight');
		$('#' + id).addClass('redditTopHighlight');
	}
//});