angular.module('mean.yourhome').controller('InstagramController', ['$scope', '$rootScope', '$http', '$interval', 'MeanUser', 'Global', 'Yourhome', 'Module', 
function($scope, $rootScope, $http, $interval, MeanUser, Global, Yourhome, Module) {
	var instagram = [];
	var counterInsta = 0;

	$scope.instaLoggedin = 'Log In With';
	
	
	$scope.initInsta = function() {		
		var requestInsta = $http({
		method: "post",
		url: "/api/yourhome/instagram"
		});
		
		requestInsta.success( function(obj){
			instagram = obj.json.data;
			console.dir(instagram);
			
			var len = obj.json.data.length;
			for(var i = 0;i < len;i++){	
				var requestInsta = $http({
					method: "post",
					url: "/api/yourhome/instagramComments",
					data: {id: obj.json.data[i].id, count: i}
				});
				requestInsta.success( function(obj1){
					instagram[obj1.count].realComments = obj1.json.data;
					counterInsta++;
				});
				requestInsta.error( function(obj){
					console.log("error finding instas");
					counterInsta = instagram.length - 1;
				});
			}
			scopingInsta();
		});	
		
		requestInsta.error( function(obj){
				console.log("error finding instas");
			}
		);
		
	}	
	function scopingInsta(){
		if(counterInsta >= instagram.length - 1){
			setTimeout(function() {scopingInsta()}, 50);
			console.log("not all done: scopingInsta()");
			return;
		}
		for(i=0; i< instagram.length;i++){
			if(!instagram[i].caption) break;
			instagram[i].caption.text = hashSearch(instagram[i].caption.text);
			instagram[i].caption.text = atSearch(instagram[i].caption.text);
		}
		console.log(instagram);
		$scope.myInsta = instagram;
	}
	$scope.whatClassIsIt= function(someValue){
		if(someValue){
			return "instaFix";
		}
		else{
			return "outProf";
		}
    }
	$scope.whatClassPhoto= function(someValue){
		if(someValue){
			return "instaFixFoto";
		}
		else{
			return "";
		}
    }
	$scope.someMethod = function (id){
		console.log(id);
		$scope.code = id;		
	}
	
	$scope.moveForVid = function(someValue){
		if(someValue){
			return "moveForVideo";
		}
		else{
			return"";
		}
	}
	
	if(MeanUser && MeanUser.user){
		if(MeanUser.user.instagram) {
			$scope.instaLoggedin = undefined;
			$interval($scope.initInsta(), 5000);
			//$scope.initInsta();
		}
		else if(MeanUser.user) $scope.instaLoggedin = 'Link';
	}
	
	$rootScope.$on('loggedin', function() {
		if(MeanUser.user.instagram) {
			$scope.instaLoggedin = undefined;
			$interval($scope.initInsta(), 5000);
			
		}
		else if(MeanUser.user) $scope.instaLoggedin = 'Link';
    });
	
	$rootScope.$on('logout', function() {
		$scope.instaLoggedin = 'Log In With';
    });
}]);

angular.module('mean.yourhome').filter("dateFilter", ['$sce', function ($sce) {
	return function (unixTime) {
		var nowTime, string;
		if (!Date.now) {
			nowTime = new Date().getTime(); 
		}
		else{
			nowTime = Math.floor(Date.now() / 1000);
		}
		string = nowTime - unixTime;
		if(string < 60){
			string = parseInt(string);
			string += "s";
		}
		else if (string < 3600){
			string = parseInt(string/60);
			string += "m";
		}
		else if(string < 86400){
			string = parseInt(string/3600);
			string += "h";
		}
		else if (string < 604800){
			string = parseInt(string/86400);
			string += "d";
		}
		else{
			string = parseInt(string/604800);
			string += "w";
		}
		return string;
	};
}]);

angular.module('mean.yourhome').filter("trustUrl", ['$sce', function ($sce) {
	return function (recordingUrl) {
		return $sce.trustAsResourceUrl(recordingUrl);
	};
}]);

function hashSearch(text){
	var prev = 0, curr;
	var hashSub, hashTag, newText = "";
	
	for(j = 0;j<text.length;j++){
		if(text[j] == "#"){
			if(isLetter(text.charAt(j+1)) || (!isNaN(parseInt(text[j+1]))))
			{
				j++;
				prev = j;
				while(isLetter(text.charAt(j)) || (!isNaN(parseInt(text[j])))){
					j++;
				}
				hashTag = text.substring(prev, j);
				newText += "<a target='_blank' href='https://www.instagram.com/explore/tags/";
				newText += hashTag;
				newText += "'>#";
				newText += hashTag;
				newText += "</a>"; 
				newText += " ";
				prev = j;
			}		
			else{
				newText += text[j];		
			}
		}
		else{
			newText += text[j];			
		}	
	}	
	return newText;
}

function atSearch(text){
	var prev = 0, curr;
	var hashSub, hashTag, newText = "";
	
	for(j = 0;j<text.length;j++){
		if(text[j] == "@"){
			if(isLetter(text.charAt(j+1)) || (!isNaN(parseInt(text[j+1]))))
			{
				j++;
				prev = j;
				while(isLetter(text.charAt(j)) || (!isNaN(parseInt(text[j])))){
					j++;
				}
				hashTag = text.substring(prev, j);
				newText += " <a target='_blank' href='https://www.instagram.com/";
				newText += hashTag;
				newText += "'>@";
				newText += hashTag;
				newText += "</a>"; 
				newText += " ";
				prev = j;
			}	
			else{
				newText += text[j];		
			}			
		}
		else{
			newText += text[j];
		}
	}	
	return newText;
}