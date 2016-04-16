'use strict';

angular.module('mean.yourhome').controller('CalendarController', ['$scope', '$rootScope', '$http', 'MeanUser', 'Global', 'Yourhome',
	function($scope, $rootScope, $http, MeanUser, Global, Yourhome) {
		$scope.global = Global;
		
		$scope.calendarLoggedin = 'Log In With';
		
		$scope.calAuth = true;
		$scope.getEvents=function(numEvents)
		{
			if($scope.calendarLoggedin !== undefined) return;
			if (isNaN(numEvents)) numEvents = 5;
			console.log("entered getEvents"+numEvents);
			$http.post('/api/yourhome/nextEvents', JSON.stringify(
				{
					numEvents: numEvents,
					code: null
				})
			)
			.success(function(data)
			{
				//console.dir(data);
				//var temp = data[0].auth;
				if (!data[0].auth)
				{
					$scope.calAuth = false;
				}
				else
				{
					data.splice(0, 1);//gets rid of first entry which isn't an event
					//data = []; uncomment to mimic an empty calendar
					$scope.events = data;
				}
				
				
			}).error(function(data, status){
				console.error("An error occured. Server returned: ");
				console.dir(data);
				if (status === 412) 
				{
					$scope.calAuth = false;
				}
			});
		};
		$scope.setEventClass = function(colID)
		{
			var retStr = "";
			switch(colID)
			{
				case "1": 
					retStr = "blueEvent";
					break;
				case "2": 
					retStr = "greenEvent";
					break;
				case "3": 
					retStr = "purEvent";
					break;
				case "4": 
					retStr = "pinkEvent";
					break;
				case "5": 
					retStr = "yelEvent";
					break;
				case "6": 
					retStr = "orangeEvent";
					break;
				case "7": 
					retStr = "turqEvent";
					break;
				case "8": 
					retStr = "greyEvent";
					break;
				case "9": 
					retStr = "darkblueEvent";
					break;
				case "10": 
					retStr = "darkgreenEvent";
					break;
				case "11": 
					retStr = "redEvent";
					break;
				default: retStr = "";	
			}
			retStr += " individualEvent";
			return retStr;
		};
		
		$scope.createEvent = function()
		{
			$('#calendarModal').modal();
		};
		
		$scope.event = {};
		$scope.event.summary = "";
		$scope.event.description = "";
		$scope.event.fromTime = new Date();
		$scope.event.untilTime = new Date(new Date().getTime()+60*60*1000);//adds an hour from now
		$scope.event.fromDate = new Date();
		$scope.event.untilDate = new Date();
		
		$scope.event.addError = false;
		$scope.event.addSuccess = false;
		
		$scope.chooseDateFromPopup = {
			opened: false
		};
		$scope.chooseDateUntilPopup = {
			opened: false
		};
		$scope.chooseDate = function(popup) {
			if (popup === "From") $scope.chooseDateFromPopup.opened = true;
			else if (popup === "Until") $scope.chooseDateUntilPopup.opened = true;
		};
		$scope.validateNewEvent = function()
		{
			
			try
			{
				console.log($scope.event.summary);
				var from = $scope.event.fromDate;
				from.setHours( $scope.event.fromTime.getHours() );
				from.setMinutes( $scope.event.fromTime.getMinutes() );
				
				console.log(from);
				var until = $scope.event.untilDate;
				until.setHours( $scope.event.untilTime.getHours() );
				until.setMinutes( $scope.event.untilTime.getMinutes() );
				console.log(until);

				if(from > until)
				{
					//console.log("Not good");
					document.getElementById("chooseDateSpan").classList.add("has-error");
					document.getElementById("saveEventBtn").disabled = true;
				}
				else 
				{
					document.getElementById("chooseDateSpan").classList.remove("has-error");
					document.getElementById("saveEventBtn").disabled = false;
				}
			}
			catch(err)
			{
				console.warn(err);
				document.getElementById("chooseDateSpan").classList.add("has-error");
				document.getElementById("saveEventBtn").disabled = true;
			}
		};
		
		$scope.saveEvent =function()
		{
			var from = $scope.event.fromDate;
			from.setHours( $scope.event.fromTime.getHours() );
			from.setMinutes( $scope.event.fromTime.getMinutes() );
			
			var until = $scope.event.untilDate;
			until.setHours( $scope.event.untilTime.getHours() );
			until.setMinutes( $scope.event.untilTime.getMinutes() );

			$http.post('/api/yourhome/saveEvent', JSON.stringify(
				{
					from: from,
					until: until,
					summary: $scope.event.summary,
					location: $scope.event.location
				})
			)
			.success(function(data)
			{
				console.log("added successfully");
				console.dir(data);
				$scope.getEvents($scope.events.length);//refreshes the calendar
				$scope.event.addError = false;
				$scope.event.addSuccess = true;
				
			}).error(function(data){
				console.error("An error occured. Server returned: ");
				console.dir(data);
				$scope.event.addSuccess = false;
				$scope.event.addError = true;
			});
		};
		
		
		if(MeanUser && MeanUser.user){
			if(MeanUser.user.google) {
				$scope.calendarLoggedin = undefined;
				$scope.getEvents(5);
			}
			else if(MeanUser.user) $scope.calendarLoggedin = 'Link';
		}
		
		$rootScope.$on('loggedin', function() {
			if(MeanUser.user.google) {
				$scope.calendarLoggedin = undefined;
				$scope.getEvents(5);
			}
			else if(MeanUser.user) $scope.calendarLoggedin = 'Link';
		});
		
		$rootScope.$on('logout', function() {
			$scope.calendarLoggedin = 'Log In With';
		});
	}]
);