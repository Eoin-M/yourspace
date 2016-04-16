var mongoose = require('mongoose'),
		User = mongoose.model('User');

module.exports = function(Yourhome, app, auth, database) {  
	var getJSON =require('get-json');
	var config = require('meanio').loadConfig();

	app.post('/api/yourhome/weather', function (req, res)
	{
		/*req.body.country = req.body.country.split(' ').join('_');
		req.body.city = req.body.city.split(' ').join('_');
		
		console.log(req.body.country + ' ' + req.body.city);
		var query = config.weather;
		query+= (req.body.country.toLowerCase() == 'united_states') ? req.body.city : req.body.country;
		query+="/";
		query+= (req.body.country.toLowerCase() == 'united_states') ? req.body.country : req.body.city;
		query+=".json";*/
		var query = config.weather;
		query += 'ireland/galway.json';
		console.log(query);
		
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
	
	app.post('/api/yourhome/toggleTemp', function(req, res){
		if(req.session.user === undefined) {
			res.sendStatus(412);
			return;
		}
		
		User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"weather": req.body.temp}}, {upsert:false}, function(err, user){
			if (err) console.log(err);
			return;
		});
		
		res.sendStatus(200);
	});
};