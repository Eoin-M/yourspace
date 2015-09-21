//IMPORTANT: Needs <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script> to run
var lat;
var long;
//window.onload = myGetLocation()
	
function myGetLocation()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition( positionToLongLat , noLocationError )
	}
	else
	{
		console.log("Geolocation is not supported by this browser.");
	}
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
			console.log(results);
			if (results[0])//says (results[1]) in original source?
			{
				alert(results[0].formatted_address);
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