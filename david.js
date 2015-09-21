var lat;
var long;

window.onload = myGetLocation()

function myGetLocation()
{
	navigator.geolocation.getCurrentPosition(function(position, noLocationError)
	{
		
		lat = position.coords.latitude;
		long = position.coords.longitude;
		//alert("latitude: "+lat+"\nlongtitude: "+long);
	});
	
}

function noLocationError(error) 
{
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
			console.log("An unknown error occurred.");
			break;
	}
}