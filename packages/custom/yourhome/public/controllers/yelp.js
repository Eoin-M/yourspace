//var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid']);


var myData = function(image, link, name, rating)
{
	this.image = image;
	this.link = link;
	this.name = name;
	this.rating = rating;
}

'use strict';
//angular.module('mean', ['ui.grid']);
/* jshint -W098 */
angular.module('mean.yourhome').controller('YelpController', ['$scope', '$http', 'Global', 'Yourhome',
  function($scope, $http, Global, Yourhome) {
    $scope.global = Global;
	var obj = "";
	var i;
	$scope.yelpWait = function ()
	{
		console.log("9");
		var requestYelp = $http({
			method: "post",
			url: "/api/yourhome/yelpApp",
			data: {location: loc.city, term: ""}
		});
	
	
	$scope.submit = function(term, place) {
		alert(place);
		requestYelp = $http({
		method: "post",
		url: "/api/yourhome/yelpApp",
		data: {location: place, term: term}
		});
		
		requestYelp.success(
			function (obj) 
			{
				yelpSuccess(obj);
			}
		);
		
		requestYelp.error(
			function(obj)
			{
				console.log("error finding with location in yelpApp");
				console.log(obj);
			}
		);
	}
	
		requestYelp.success(
			function(obj)
			{
				console.log(obj);
				yelpSuccess(obj);
			}
		);	
		
		requestYelp.error(
			function(obj)
			{
				console.log("error finding with location in yelpApp");
				console.log(obj);
			}
		);
	}
	
	function yelpSuccess(obj)
	{

		$scope.whenHttpRequestHasFinishedLoading = true;
		console.log(obj);
		
		var yelpDataArray = new Array();
		
		for(i = 0; i < obj.businesses.length; i++)
		{
			yelpDataArray.push(new myData);
			yelpDataArray[i].image = obj.businesses[i].image_url;
			yelpDataArray[i].link = obj.businesses[i].url;
			yelpDataArray[i].name = new Array();
			yelpDataArray[i].name.push(obj.businesses[i].name);
			//yelpDataArray[i].name.push("");
			if(typeof obj.businesses[i].categories[0][0] !== "undefined" )
			{
				yelpDataArray[i].name.push(obj.businesses[i].categories[0][0]);
			}
			yelpDataArray[i].rating = obj.businesses[i].rating_img_url_large;
		}
		
		
		console.log(obj);
		console.log(yelpDataArray);

		$scope.gridOptions = {
			enableSorting: true,
			enableColumnMenus: false,
			enableHorizontalScrollbar: 0, 
			enableVerticalScrollbar: 2,
			maxVisibleRowCount: 4,
			minRowsToShow: 4,
			rowHeight:100,
			//showHeader: false,
			columnDefs: [
			{ name: 'image', width: '35%', cellTemplate:"<a href=\"{{row.entity.link}}\" target=\"_blank\"><img width=\"100px\" style=\"width:100px;\"ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src> </a>", enableSorting: false},
			{ name: 'link', width: 0, enableSorting: false, visible: false},
			{ name: 'name', cellClass: 'name', cellTemplate:'<a href=\"{{row.entity.link}}\" target=\"_blank\"><div ng-repeat="item in row.entity[col.field]">{{item}}<br></div></a>' },
			{ name: 'rating', width: '38%', cellTemplate:"<a href=\"{{row.entity.link}}\" target=\"_blank\"><div style=\"height: 100px;\"><img width=\"100px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src></div></a>"}
			
			]				
		};
		
		$scope.gridOptions.data = yelpDataArray;
	}
}]);

