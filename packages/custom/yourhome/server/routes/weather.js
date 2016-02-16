module.exports = function(Yourhome, app, auth, database) {  
	var getJSON =require('get-json');

	app.post('/api/yourhome/weather', function (req, res)
	{
		var query ="http://api.wunderground.com/api/3db9db7515033481/forecast/q/";
		query+=req.body.country;
		query+="/";
		query+=req.body.city;
		query+=".json";
		
		getJSON(query, function(err, response){
			if(err)
			{
				console.log(err);
			}
			else
			{
				//res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: response}));
			}
		});

	});
};