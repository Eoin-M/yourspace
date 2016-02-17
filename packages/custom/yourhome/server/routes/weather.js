module.exports = function(Yourhome, app, auth, database) {  
	var getJSON =require('get-json');
	var config = require('meanio').loadConfig();

	app.post('/api/yourhome/weather', function (req, res)
	{
		var query = config.weather;
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