var loc = new UserLocation;

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
		//return false;
	}
	//TODO wait for set time, then return false if 
}

function positionToLongLat(position)
{
	console.log("longtitude: "+position.coords.longitude+"\nlatitude: "+position.coords.latitude);
	loc.long = position.coords.longitude;
	loc.lat = position.coords.latitude;
	loc.isFound = true;
	runGoogleNavigatorAPI( position.coords.longitude , position.coords.latitude );
}

function noLocationError(error) //should work but I've never seen it called...
{
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
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat, long);
	geocoder.geocode({'latLng': latlng}, function(results, status)
	{//start of anonymous function taken as the second input of geocoder.geocode method
		if (status == google.maps.GeocoderStatus.OK)
		{
			if (results[0])//if there is a result
			{
				loc.address = results[0].formatted_address;
				//console.log(results[0]);
				var i = 0;
				for (i = 0; i < results[0].address_components.length; i++)
				{
					
					var j = 0;
					for (j = 0; j < results[0].address_components[i].types.length; j++)
					{
						if (results[0].address_components[i].types[j] == "administrative_area_level_1")
						{
							loc.city = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] == "administrative_area_level_6")
						{
							loc.state = results[0].address_components[i].long_name;
						}
						else if (results[0].address_components[i].types[j] == "country")
						{
							loc.country = results[0].address_components[i].long_name;
						}
					}
				}
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

function showLoc()//temporary function to show off locations
{
	alert("full address = "+ loc.address + "\ncity = " + loc.city +"\nstate = "+ loc.state +"\ncountry = "+loc.country);
}