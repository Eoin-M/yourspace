//manualGetLoc
angular.module('mean.yourhome').controller('JobController', ['$scope', '$rootScope', '$http', 'Global', 'Yourhome',
function($scope, $rootScope, $http, Global, Yourhome) {
	
	var city , country, term, requestJobs;
	$scope.jobType = "All Jobs";
	
	$rootScope.$on('loc', function() {
		$scope.jobGet();
	});
	
	$scope.jobGet = function ()
	{
		$scope.jobCity = loc.city;
		$scope.jobCountry = loc.country;
		country = loc.country;
		country = country.toLowerCase();
		country = countryMap[country];
		$scope.jobTerm = "";

		city = loc.city;
		
		requestJobs = $http({
		method: "post",
		url: "/api/yourhome/jobApp",
		data: {city: city, country: country, term: "", type: "all"}
		});
		requestJobs.success( function(obj){	
			if(obj.length == 0){
				console.log("no jobs found");
				return;
			}
			else {
				jobSuccess(obj);
			}
		});	
		requestJobs.error( function(obj){
				console.log("error finding with location in yelpApp");
			}
		);
	}
	$scope.submit = function(jobCity, jobCountry, jobTerm, jobType) { 
		city = (jobCity).split(' ').join('+');
		country = jobCountry;
		country = country.toLowerCase();
		country = countryMap[country];
		
		if(typeof term !== 'undefined') term = (jobTerm).split(' ').join('+');
				
		if(country == 'us') country = '';
		var type = jobType;
		if(type == 'All Jobs') type = 'all';
		
		requestJobs = $http({
			method: "post",
			url: "/api/yourhome/jobApp",
			data: {city: city, country: country, term: term, type: type}
		});
		
		requestJobs.success( function(obj){	
			if( (obj.json.results == 0 || typeof obj.json.results === 'undefined')){
				
				$('#jobModal').modal();
				return;
			}
			else {
				jobSuccess(obj);
			}
		});	
		requestJobs.error( function(obj){
				console.log("error finding with location in jobApp");
			}
		);
	}
	function jobSuccess(obj){
		console.log(obj);
		$scope.jobs = obj.json.results;
	}
	$scope.jobClick = function(type){
		$scope.jobType = type;
		
	}	
}]);

angular.module('mean.yourhome').directive('animateMe', function() {
   return function(scope, element, attrs) {
      scope.$watch(attrs.animateMe, function() {
         element.show(750);
      })
   }
});


