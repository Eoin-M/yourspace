"use strict";

var loc = new UserLocation;
var tempLoc = new UserLocation;
var mapMarker = null;

function myGetLocation()
{
	setTimeout(function(){angular.element(document.getElementById("yourhome")).scope().getLocation();} , 1000);
	
	/*if (navigator.geolocation)//if navigator geolocation is supported then
	{
		navigator.geolocation.getCurrentPosition( positionToLongLat , noLocationError );
		//In form of .getCurrentPosition(successFunction, failLocation)
	}
	else
	{
		console.log("Geolocation is not supported by this browser.");
		loc.isFound = false;
		//return false;
		
	}*/
	//setTimeout(function(){angular.element(document.getElementById("divCntrl")).scope().yelpWait();} , 5000);
    //TODO wait for set time, then maybe call the map function if isFound isn't true
}

function positionToLongLat(position)
{
	//console.log("longtitude: "+position.coords.longitude+"\nlatitude: "+position.coords.latitude);
	loc.long = position.coords.longitude;
	loc.lat = position.coords.latitude;
	loc.isFound = true;
	runGoogleNavigatorAPI( position.coords.longitude , position.coords.latitude, loc);
	//console.log(loc);
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

var attempts = 0;

function runGoogleNavigatorAPI(long, lat, location)
//http://stackoverflow.com/questions/6797569/get-city-name-using-geolocation source
{
	if (typeof google === 'undefined') {
		setTimeout(function() {
			if(attempts >= 15) {
				angular.element(document.getElementById("yourhome")).scope().getLocation();
				return;
			}
			runGoogleNavigatorAPI(long, lat, loc);
		}, 250);
		console.log("RETRY!");
		attempts++;
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
				location.address = results[0].formatted_address;
				console.dir(results);
				
				location.city = undefined;
				location.state = undefined;
				location.country = undefined;
				//clears the fields in case this isn't the first location checked and they keep their old values because nothing matches the categories
                location.address = results[0].formatted_address;
				for (var i = 0; i < results[0].address_components.length; i++)
				{
					for (var j = 0; j < results[0].address_components[i].types.length; j++)
					{
						if (results[0].address_components[i].types[j] === "locality")
						{
							location.city = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] === "administrative_area_level_1")
						{
							location.state = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] === "country")
						{
							location.country = results[0].address_components[i].long_name;
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
                document.getElementById("addressLine").innerText = location.address;
				angular.element(document.getElementById("yourhome")).scope().emitLocation();
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
        console.log("Address: "+loc.address+" \nCity: "+loc.city+" \nState: "+loc.state+" \nCountry: "+loc.country);
	});
    
    return loc;
}

function initMap() 
{
	var myLatlng;
    var zoom;
	if (loc.isFound) 
	{
		myLatlng = {lat: loc.lat, lng: loc.long};
        zoom = 10;
    }
	else 
	{
		myLatlng = {lat: 0, lng: 0};
        zoom = 5;
	}
	var myMap = new google.maps.Map(document.getElementById('map'), 
	{
    	zoom: zoom,
    	center: myLatlng
	});
    //google.maps.event.trigger(myMap, "resize");
    /*google.maps.event.addListenerOnce(myMap, 'idle', function() {
        google.maps.event.trigger(myMap, 'resize');//resizes to fix a bug in google maps
    });*/
    
    if (loc.isFound)//if we know where they are drop a pin there
    {
        if (mapMarker !== null) mapMarker.setMap(null);//if there's already a pin clear it
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: myMap,
            visible: true,
            animation: google.maps.Animation.DROP,
        });
        mapMarker = marker;
        mapMarker.setMap(myMap);
    }
    
	myMap.addListener('click', function(event) 
	{
        if (mapMarker !== null) mapMarker.setMap(null);//if there's already a pin clear it
		var marker = new google.maps.Marker({
			position: event.latLng,
			map: myMap,
			visible: true,
			animation: google.maps.Animation.DROP,
		});
        tempLoc.isFound = true;
        tempLoc.lat = marker.position.lat();
        tempLoc.long = marker.position.lng();
        runGoogleNavigatorAPI(marker.position.lng(), marker.position.lat(), tempLoc);
        mapMarker = marker;
        
	});
    
}

function showLoc()//temporary function to show off locations
{
	alert("full address = "+ loc.address + "\ncity = " + loc.city +"\nstate = "+ loc.state +"\ncountry = "+loc.country);
}

function manualGetLoc()
{
	console.log("manual location");
    $("#locationModal").on("shown.bs.modal", function () {
        initMap();
    });
    $('#locationModal').modal();
   
}

function manualUpdateLoc()
{
    //runGoogleNavigatorAPI(mapMarker.position.lng(), mapMarker.position.lat());
    loc = tempLoc;
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