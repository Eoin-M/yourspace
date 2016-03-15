'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('TwitterController', ['$scope', '$http', '$timeout', 'Global', 'Yourhome',
  function($scope, $http, $timeout, Global, Yourhome) {
    $scope.global = Global;
	$scope.replyTweet = {};
	$scope.newTweet = {};
	var tweets = [];
	
	$scope.openTwitterStream = function(){
		openStream();
	}
	
	function openStream(){
		$http.post('/api/yourhome/twitterTimeline')
		.success(function(data){
			tweets = data.tweets;
			$scope.tweets = tweets;
			console.dir(data.tweets);
		})
		.error(function(data){
			tweets = [];
			var tweetErr = {
				text: 'Server Error! Please try again later.',
				retweet_count: 0,
				favorite_count: 0,
				userTweet: true,
				id: -1,
				created_at: 'now',
				error: true
			};
			tweetErr.user = {
				name: 'YourSpace',
				screen_name: 'yourspacewebapp',
				img: 'http://abs.twimg.com/sticky/default_profile_images/default_profile_4_normal.png'
			};
			tweets[0] = tweetErr;
			$scope.tweets = tweets;
		});
	}
	
	$scope.postTweet = function(){
		$http.post('/api/yourhome/postTweet', JSON.stringify({tweet: $scope.newTweet.tweet}))
		.success(function(data){
			tweets = newFirst(tweets, data.tweet);
			$scope.tweets = tweets;
			console.log("Post");
		});
		$scope.newTweet.tweet = null;
	}
	
	$scope.twitterRetweet = function(tweet){
		if(!tweet.retweeted){
			$http.post('/api/yourhome/twitterRetweet', JSON.stringify({id: tweet.id_str}))
			.success(function(data){
				if(!isNaN(tweet.retweet_count)){
					tweet.retweet_count++;
				}
				tweet.retweeted = true;
			});
		}
		else {
			$http.post('/api/yourhome/twitterUnretweet', JSON.stringify({id: tweet.id_str}))
			.success(function(data){				
				if(!isNaN(tweet.retweet_count)){
					tweet.retweet_count--;
				}
				tweet.retweeted = false;
			});
		}		
	}

	function newFirst(arr, e){
		for(var i = arr.length-1; i >= 0;  i--){
			arr[i+1] = arr[i];
			arr[i+1].arrayPos++;
		}
		arr[0] = e;
		arr[0].arrayPos = 0;
		return arr;
	}
	
	function removeElement(arr, e){
		for(var i = e.arrayPos; i < arr.length-1; i++){
			arr[i] = arr[i+1];
			arr[i].arrayPos = i;
		}
		arr.pop();
		return arr;
	}
	
	$scope.twitterDelete = function(tweet){
		$http.post('/api/yourhome/twitterDelete', JSON.stringify({id: tweet.id_str}))
		.success(function(data){
			tweets = removeElement(tweets, tweet);
			console.log("Delete");
			$scope.tweets = tweets;
		});
	}
	
	$scope.assignReplyTweet = function(tweet){
		$scope.replyTweet = tweet;
		$scope.newReplyTweet = {};
		$scope.replyPeople = '';
		$scope.replyPeople = '@' + tweet.user.screen_name + ' ';
		for(var i = 0; i < tweet.entities.user_mentions.length; i++){
			$scope.replyPeople += '@';
			$scope.replyPeople += tweet.entities.user_mentions[i].screen_name;
			$scope.replyPeople += ' ';
		}
		$scope.newReplyTweet.tweet = $scope.replyPeople;
		setTimeout(function (){
			$('#replyTweetInput').focus();
		}, 500);
	}
	
	$scope.twitterReply = function(){
		if($scope.replyTweet.id == -1) return;
		$scope.replyTweet.reply = $scope.newReplyTweet.tweet;
		$http.post('/api/yourhome/twitterReply', JSON.stringify({tweet: $scope.replyTweet}))
		.success(function(data){
			tweets = newFirst(tweets, data.tweet);
			$scope.tweets = tweets;
		});
	}
	
	/*$timeout(function(){
		openStream();
	}, 10000);*/
  }
]);