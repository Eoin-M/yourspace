var loc = new UserLocation;
//var city = "new york";

function myGetLocation()
{
	if (navigator.geolocation)//if navigator geolocation is supported then
	{
		navigator.geolocation.getCurrentPosition( positionToLongLat , noLocationError );
		//In form of .getCurrentPosition(successFunction, failLocation)
	}
	else
	{
		console.log("Geolocation is not supported by this browser.");
		loc.isFound = false;
		//return false;
	}
	//setTimeout(function(){angular.element(document.getElementById("divCntrl")).scope().yelpWait();} , 5000);
//TODO wait for set time, then maybe call the map function if isFound isn't true
}

function positionToLongLat(position)
{
	console.log("longtitude: "+position.coords.longitude+"\nlatitude: "+position.coords.latitude);
	loc.long = position.coords.longitude;
	loc.lat = position.coords.latitude;
	loc.isFound = true;
	runGoogleNavigatorAPI( position.coords.longitude , position.coords.latitude);
	console.log(loc);
}

function noLocationError(error) //should work but I've never seen it called...
{
	console.log("err");
	loc.long = null;
	loc.lat = null;
	loc.address = null;
	loc.city = null;
	loc.state = null;
	loc.country = null;
	loc.isFound = false;
	switch(error.code) {
		case error.PERMISSION_DENIED:
			console.log("The user denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			console.log("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			console.log("An unknown error occurred trying to find user's location.");
			break;
	}
}

function runGoogleNavigatorAPI(long, lat)
//http://stackoverflow.com/questions/6797569/get-city-name-using-geolocation source
{
	if (typeof google === 'undefined') {
		setTimeout(function() {runGoogleNavigatorAPI(long, lat);}, 250);
		console.log("RETRY!");
		return;
	}
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat, long);
	geocoder.geocode({'latLng': latlng}, function(results, status)
	{//start of anonymous function taken as the second input of geocoder.geocode method
		if (status === google.maps.GeocoderStatus.OK)
		{
			if (results[0])//if there is a result
			{
				loc.address = results[0].formatted_address;
				console.dir(results);
				
				loc.city = undefined;
				loc.state = undefined;
				loc.country = undefined;
				//clears the fields in case this isn't the first location checked and they keep their old values because nothing matches the categories
				var i = 0;
				for (i = 0; i < results[0].address_components.length; i++)
				{
					var j = 0;
					for (j = 0; j < results[0].address_components[i].types.length; j++)
					{
						if (results[0].address_components[i].types[j] === "locality")
						{
							loc.city = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] === "administrative_area_level_1")
						{
							loc.state = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] === "country")
						{
							loc.country = results[0].address_components[i].long_name;
						}
						//route means street name
						//Galway is locality and political
						//Galway City is administrative_area_level_2 and political
						//Galway is administrative_area_level_1 and political
						//Ireland is country and political
						
						//Have city as locality
						//Have state as administrative_area_level_1
					}
				}
				//angular.element(document.getElementById("weather")).scope().weatherGet();
				//angular.element(document.getElementById("yelp")).scope().yelpWait();
			}
			else
			{
				console.log("No results found");
				loc.address = null;
				loc.city = null;
				loc.state = null;
				loc.country = null;
			}
		}
		else
		{
			console.log("Geocoder failed due to: "+status);
			loc.address = null;
			loc.city = null;
			loc.state = null;
			loc.country = null;
		}
	});
    return loc;
}

function initMap() 
{
	var myLatlng;
    console.dir(loc);
	if (loc.isFound) 
	{
		myLatlng = {lat: loc.lat, lng: loc.long};
        console.log("loc.lat: "+loc.lat);
        console.log("loc.long: "+loc.long);
	}
	else 
	{
        console.log("loc not found");
		myLatlng = {lat: 0, lng: 0};
	}
    console.log(myLatlng);
	var myMap = new google.maps.Map(document.getElementById('map'), 
	{
    	zoom: 5,
    	center: myLatlng,
	});
    google.maps.event.addListenerOnce(myMap, 'idle', function() {
        google.maps.event.trigger(myMap, 'resize');
    });
    

   
	myMap.addListener('click', function(event) 
	{
		var marker = new google.maps.Marker({
			position: event.latLng,
			map: myMap,
			visible: true,
			animation: google.maps.Animation.DROP,
		});
		
		setTimeout(function() //delay of 500ms to let pin dropping animation happen first
		{
			if (confirm("Is this your location?"))
			{
				loc.long = event.latLng.lng();
				loc.lat = event.latLng.lat();
				loc.isFound = true;
                console.log(loc);
				runGoogleNavigatorAPI(event.latLng.lng(), event.latLng.lat());
			}
			else
			{
				marker.setMap(null);
			}
		}, 500);
		
	});
}

function showLoc()//temporary function to show off locations
{
	alert("full address = "+ loc.address + "\ncity = " + loc.city +"\nstate = "+ loc.state +"\ncountry = "+loc.country);
}

function manualGetLoc()
{
    $('#locationModal').modal();
    initMap();
}

function UserLocation(long, lat, address, city, state, country, isFound)//A constructor function
{
	this.long = long;
	this.lat = lat;
	this.address = address;
	this.city = city;
	this.state = state;
	this.country = country;
	this.isFound = isFound;//boolean on whether we have longitude and latitude coordinates
}

//hard code New York: Lat is 40.7127, Long is -74.0059
//hard code Mountain View California: Lat is 37.421996, Long is -122.085033
//Paris 48.858336, 2.294528
//Joannaville Poland 53.426777, 14.512333
//Tokyo 35.738422, 139.710961
//Rio -22.951862, -43.210766
//Capetown -34.357214, 18.474284
//Sydney -33.857169, 151.215173