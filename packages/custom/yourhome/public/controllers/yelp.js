//var app = angular.module('app', ['ngAnimate']);

angular.module('mean.yourhome').controller('YelpController', ['$scope', '$rootScope', '$http', 'Global', 'Yourhome',
function($scope, $rootScope, $http, Global, Yourhome) {
	var location , term = "food", requestYelp;
	
	$rootScope.$on('loc', function() {
		$scope.yelpWait();
	});
	
	$scope.yelpWait = function ()
	{
		if(typeof loc.city === 'undefined')
		{
			if(typeof loc.state === 'undefined')
			{ 
				if(typeof loc.country === 'undefined'){ console.log('cant use location');}
				else{ location = loc.country;}
			}
			else{ location = loc.state;}
		}
		else { location = loc.city;}
		console.log(loc.city);
		
	console.dir(Yourhome);
		$scope.place = location;
		requestYelp = $http({
		method: "post",
		url: "/api/yourhome/yelpApp",
		data: {location: 'galway', term: term}
		});
		requestYelp.success( function(obj){	
			if(obj.length == 0){
				console.log("no businesses found");
				return;
			}
			else {
				yelpSuccess(obj);
			}
		});	
		requestYelp.error( function(obj){
				console.log("error finding with location in yelpApp");
			}
		);
	}
	$scope.submit = function(term, place) {
		
		requestYelp = $http({
		method: "post",
		url: "/api/yourhome/yelpApp",
		data: {location: term, term: place}
		});
		requestYelp.success( function(obj){	
			if((typeof obj.businesses === 'undefined') || obj.businesses.length == 0 ){
				$('#yelpModal').modal();
				console.log("no businesses found");
				return;
			}
			else {
				yelpSuccess(obj);
			}
		});	
		requestYelp.error( function(obj){
				console.log("error finding with location in yelpApp");
				console.log(obj);
			}
		);
	}
	function yelpSuccess(obj)
	{
		console.log(obj.businesses);
		var yelpData = obj.businesses;
		$scope.yelpData = yelpData;
	}

}]);

angular.module('mean.yourhome').directive('errSrc', function() {
  return {
	link: function(scope, element, attrs) {
	  element.bind('error', function() {
		if (attrs.src != attrs.errSrc) {
		  attrs.$set('src', attrs.errSrc);
		}
	  });
	  
	  attrs.$observe('ngSrc', function(value) {
		if (!value && attrs.errSrc) {
		  attrs.$set('src', attrs.errSrc);
		}
	  });
	}
  }
});

