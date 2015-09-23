/* Up to date version of location functions which replaces david.js file. They will be changed in future and I'm planning on adding a location object 
	as a global varibale instead but this works for now. To get location in longtitude and latitude call the myGetLocation()
	function and the global variables lat and long will be changed. 
*/
var lat;
var long;

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
	lat = position.coords.latitude;
	long = position.coords.longitude;
	console.log("longtitude: "+long+"\nlatitude: "+lat);
	runGoogleNavigatorAPI();
}

function noLocationError(error) //should work but I've never seen it called...
{
	//alert("failed");
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

function runGoogleNavigatorAPI()
//http://stackoverflow.com/questions/6797569/get-city-name-using-geolocation source
{
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat, long);
	geocoder.geocode({'latLng': latlng}, function(results, status)
	{//start of anonymous function taken as the second input of geocoder.geocode method
		if (status == google.maps.GeocoderStatus.OK)
		{
			if (results[0])//says (results[1]) in original source?
			{
				console.log(results[0].formatted_address);
				//TODO: results object can be further parsed to get city, country etc.
			}
			else
			{
				console.log("No results found");
			}
		}
		else
		{
			alert("Geocoder failed due to: "+status);
		}
	});
}