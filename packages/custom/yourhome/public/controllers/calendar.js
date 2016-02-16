'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('CalendarController', ['$scope', '$http', 'Global', 'Yourhome',
  function($scope, $http, Global, Yourhome) {
    $scope.global = Global;
	
		$scope.getEvents=function(numEvents)
		{
			
			console.log("entered getEvents"+numEvents);
			$scope.calAuth = true;//to hide the button
			$http.post('/api/yourhome/nextEvents', JSON.stringify(
                {
                    numEvents: numEvents,
                    code: null
                })
            )
			.success(function(data)
			{
                console.dir(data);
				//var temp = data[0].auth;
				if (!data[0].auth)
				{
					$scope.calAuthLink = $sce.trustAsResourceUrl(data[0].link);
					$scope.calAuth = data[0].auth;
				}
				else
				{
					data.splice(0, 1)//gets rid of first entry which isn't an event
					console.dir(data);
					
					$scope.events = data;
				}
				
				
			}).error(function(data){
				console.error("An error occured. Server returned: ");
				console.dir(data);
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
		}
		$scope.createEvent = function()
        {
            $('#calendarModal').modal();
        }
        
        $scope.eventFromTime = new Date();
        $scope.eventUntilTime = new Date(new Date().getTime()+60*60*1000);//adds an hour from now
        $scope.eventFromDate = new Date();
        $scope.eventUntilDate = new Date();
        
        $scope.chooseDateFromPopup = {
            opened: false
        };
        $scope.chooseDateUntilPopup = {
            opened: false
        };
        $scope.chooseDate = function(popup) {
            if (popup == "From") $scope.chooseDateFromPopup.opened = true;
            else if (popup == "Until") $scope.chooseDateUntilPopup.opened = true;
        };
        $scope.validateNewEvent = function()
        {
            try
            {
                var from = $scope.eventFromDate;
                from.setHours( $scope.eventFromTime.getHours() );
                from.setMinutes( $scope.eventFromTime.getMinutes() );
                
                var until = $scope.eventUntilDate;
                until.setHours( $scope.eventUntilTime.getHours() );
                until.setMinutes( $scope.eventUntilTime.getMinutes() );

                if(from > until)
                {
                    console.log("Not good");
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
        }
        $scope.saveEvent =function()
        {
            //var location = document.getElementById("")
            
            var from = $scope.eventFromDate;
            from.setHours( $scope.eventFromTime.getHours() );
            from.setMinutes( $scope.eventFromTime.getMinutes() );
            
            var until = $scope.eventUntilDate;
            until.setHours( $scope.eventUntilTime.getHours() );
            until.setMinutes( $scope.eventUntilTime.getMinutes() );

            $http.post('/api/yourhome/saveEvent', JSON.stringify(
                {
                    from: from,
                    until: until,
                    summary: $scope.eventSummary,
                    location: $scope.eventLocation
                })
            )
            .success(function(data)
            {
                console.log("added successfully");
                console.dir(data);
                $scope.getEvents($scope.events.length);//refreshes the calendar
                $scope.eventAddError = false;
                $scope.eventAddSuccess = true;
                
            }).error(function(data){
                console.error("An error occured. Server returned: ");
                console.dir(data);
                $scope.eventAddSuccess = false;
                $scope.eventAddError = true;
            });
        }
	}]);