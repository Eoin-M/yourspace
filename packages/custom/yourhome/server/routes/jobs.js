module.exports = function(Yourhome, app, auth, database) {  

	var getJSON =require('get-json');

	var jobKey ="4579917325063703"

	app.post('/api/yourhome/jobApp', function (req, res)
	{
		var jobURL ="http://api.indeed.com/ads/apisearch?publisher=";
		jobURL += jobKey;
		jobURL += "&q=";
		if(req.body.term){
			jobURL += req.body.term;
		}
		jobURL += "&format=json";
		jobURL += "&l=";
		jobURL += req.body.city;
		//jobURL += "%2C+"tx used for state if needed in future 
		jobURL += "&sort=&radius=&st=&jt="
		if(req.body.type){
			jobURL += req.body.type;
		}
		jobURL += "&start=&limit=&fromage=&filter=&latlong=1&co=";
		jobURL += req.body.country;
		jobURL += "&chnl=&v=2";

		console.log(jobURL);
		
		getJSON(jobURL, function(err, response){
			if(err)
			{
				console.log(err);
			}
			else
			{
				res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: response}));
			}
		});
	});
	
};