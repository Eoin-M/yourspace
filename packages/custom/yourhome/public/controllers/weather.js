'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('WeatherController', ['$scope', '$rootScope', '$http', 'MeanUser', 'Global', 'Yourhome',
  function($scope, $rootScope, $http, MeanUser, Global, Yourhome) {
    $scope.global = Global;
	//var isFirefox = typeof InstallTrigger !== 'undefined';
	var isChrome = !!window.chrome && !!window.chrome.webstore;
	
	$scope.custom = true;
	$scope.weatherLoggedin = false;
	
	$rootScope.$on('loggedin', function() {
		$scope.custom = MeanUser.user.weather;
		$scope.weatherLoggedin = true;
	});
	
	$rootScope.$on('loc', function() {
		$scope.weatherGet();
	});
	
	$scope.weatherGet = function ()
	{
		//console.dir(loc);
		var country = getIndexOfCountry((loc.country).toLowerCase());
		if(typeof loc.city === 'undefined')
		{
			if(typeof loc.state !== 'undefined'){ console.log('cant use location');}
			else
			{
				var requestWeather = $http({
					method: "post",
					url: "/api/yourhome/weather",
					data: {city: loc.state, country: country}
				});
			}
		}
		else 
		{
			var requestWeather = $http({
				method: "post",
				url: "/api/yourhome/weather",
				data: {city: loc.city, country: country}
			});
		}
		requestWeather.success(
			function(data) 
			{
				var weatherIconCounter;
				$scope.day1c = data.json.forecast.txt_forecast.forecastday[0].fcttext_metric;
				$scope.day1f = data.json.forecast.txt_forecast.forecastday[0].fcttext;
				$scope.day2c = data.json.forecast.txt_forecast.forecastday[1].fcttext_metric;
				$scope.day2f = data.json.forecast.txt_forecast.forecastday[1].fcttext;
				$scope.day3c = data.json.forecast.txt_forecast.forecastday[2].fcttext_metric;
				$scope.day3f = data.json.forecast.txt_forecast.forecastday[2].fcttext;
				$scope.day4c = data.json.forecast.txt_forecast.forecastday[3].fcttext_metric;
				$scope.day4f = data.json.forecast.txt_forecast.forecastday[3].fcttext;
				data = data.json.forecast.simpleforecast.forecastday;
				if(isChrome)
				{	
					for(weatherIconCounter = 0; weatherIconCounter < 4; weatherIconCounter++)
					{
						if(data[weatherIconCounter].icon == ("cloudy" || "mostlycloudy")){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloud.html";}
						else if(data[weatherIconCounter].icon == "flurries"){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudDrizzle.html";}
						else if(data[weatherIconCounter].icon == "chanceflurries"){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudDrizzleSun.html"; }
						else if(data[weatherIconCounter].icon == ("fog" || "hazy")){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudFog.html";}
						else if(data[weatherIconCounter].icon == ("chancesleet"|| "sleet")){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudHail.html";}
						else if(data[weatherIconCounter].icon == "rain"){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudRain.html";}
						else if(data[weatherIconCounter].icon == "chancerain"){ data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudDrizzleSun.html";}
						else if(data[weatherIconCounter].icon == ("chancesnow"|| "snow")){data[weatherIconCounter].icon = "/yourhome/assets/icons/cloudSnow.html";}
						else if(data[weatherIconCounter].icon == "tstorms"){ data[weatherIconCounter].icon = "/yourhome/assets/icons/lightning.html";}
						else if(data[weatherIconCounter].icon == "chancetstorms"){data[weatherIconCounter].icon = "/yourhome/assets/icons/lightningSun.html";}
						else if(data[weatherIconCounter].icon == ("partlycloudy"|| "mostlysunny") ){ data[weatherIconCounter].icon = "/yourhome/assets/icons/partialCloud.html";}
						else if(data[weatherIconCounter].icon ==  ("clear"|| "sunny")){ data[weatherIconCounter].icon = "/yourhome/assets/icons/sun.html";}
						else { data[weatherIconCounter].icon  = "/yourhome/assets/icons/cloud.html";}
					}
				}
				else
				{
					for(weatherIconCounter = 0; weatherIconCounter < 4; weatherIconCounter++)
					{
						if(data[weatherIconCounter].icon == ("cloudy" || "mostlycloudy")){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloud.svg";}
						else if(data[weatherIconCounter].icon == "flurries"){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudDrizzle.svg";}
						else if(data[weatherIconCounter].icon == "chanceflurries"){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudDrizzleSun.svg"; }
						else if(data[weatherIconCounter].icon == ("fog" || "hazy")){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudFog.svg";}
						else if(data[weatherIconCounter].icon == ("chancesleet"|| "sleet")){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudHail.svg";}
						else if(data[weatherIconCounter].icon == "rain"){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudRain.svg";}
						else if(data[weatherIconCounter].icon == "chancerain"){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudDrizzleSun.svg";}
						else if(data[weatherIconCounter].icon == ("chancesnow"|| "snow")){data[weatherIconCounter].icon = "/yourhome/assets/SVG/cloudSnow.svg";}
						else if(data[weatherIconCounter].icon == "tstorms"){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/lightning.svg";}
						else if(data[weatherIconCounter].icon == "chancetstorms"){data[weatherIconCounter].icon = "/yourhome/assets/SVG/lightningSun.svg";}
						else if(data[weatherIconCounter].icon == ("partlycloudy"|| "mostlysunny") ){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/partialCloud.svg";}
						else if(data[weatherIconCounter].icon ==  ("clear"|| "sunny")){ data[weatherIconCounter].icon = "/yourhome/assets/SVG/sun.svg";}
						else { data[weatherIconCounter].icon  = "/yourhome/assets/SVG/cloud.svg";}
					}
				}
				
				$scope.data = data;	
				$scope.data.pop();
				$scope.day1 = data[0].date.weekday;
				$scope.day2 = data[1].date.weekday;
				$scope.day3 = data[2].date.weekday;
				//$scope.day4 = data[3].date.weekday;
			}
		);
	}
	
	$scope.toggleTemp = function() 
	{
		$scope.custom = !($scope.custom);
		if($scope.weatherLoggedin) $http.post('/api/yourhome/toggleTemp', {temp: $scope.custom});
	}	
}]);