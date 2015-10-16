$(document).ready(function(){
	$("#btn1").click(function(){
		var weather_json = 0;
		var newText;
		var lat = loc.lat.toFixed(2);
		var long = loc.long.toFixed(2);
		
		$.ajax({
			url: '/weather',
			type: 'post',
			dataType: 'json',
			//data: JSON.stringify({id: id}),
			//contentType: 'application/json',
			success: function(data){
				console.log(data.json);
				weather_json = data.json.weather;
				$("#today").text(weather_json.forecast[0].date);
				$("#2moro").text(weather_json.forecast[1].date);
				$("#desc_today").text(weather_json.forecast[0].day[0].weather_text);
				$("#desc_2moro").text(weather_json.forecast[1].day[0].weather_text);
				$("#temp_today").text(weather_json.forecast[0].day_max_temp);
				document.getElementById('temp_today').innerHTML = document.getElementById('temp_today').innerHTML +"&deg;C";
				$("#temp_2moro").text(weather_json.forecast[1].day_max_temp);
				document.getElementById('temp_2moro').innerHTML = document.getElementById('temp_2moro').innerHTML +"&deg;C";
				$("#night_today").text(weather_json.forecast[0].night_min_temp);
				document.getElementById('night_today').innerHTML = document.getElementById('night_today').innerHTML +"&deg;C";
				$("#night_2moro").text(weather_json.forecast[1].night_min_temp);
				document.getElementById('night_2moro').innerHTML = document.getElementById('night_2moro').innerHTML +"&deg;C";
			},
		});
		
	   // alert(weather_json.curren_weather[0].temp);
		
		/*$.getJSON(weather_json, function(obj){
			$.each(obj, function(i, field){
				alert(obj);
            });
        });*/
	});
});

function testFile()
{
	alert((loc.long);
}
