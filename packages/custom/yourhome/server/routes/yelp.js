module.exports = function(Yourhome, app, auth, database) {  

//*****************Yelp********************
	var Yelp = require("yelp");
	var yelp = new Yelp({
		consumer_key: "yES4c6tEdt92M4CN6s4IPw", 
		consumer_secret: "ddWV49HBFPNI0O68qkogPbPmMM4",
		token: "_ZkCxGmZJWBgJGeA4mzr6x9UolthcFCB",
		token_secret: "oxw-BUsplMq-uYDRmuJd2j2BJl8"
	});
	
	app.post('/api/yourhome/yelpApp', function (req, res)
	{
		var location, term;
		term = (req.body.term);
		location = (req.body.location);
		console.log(location + " " +term);
		
		yelp.search({term: term, location: location}, function(error, data) {
			console.log(error);
			//console.log(data);http://s3-media2.fl.yelpcdn.com/assets/2/www/img/1d04a136ee3e/ico/stars/v1/stars_large_0.png http://s3-media2.fl.yelpcdn.com/assets/2/www/img/d63e3add9901/ico/stars/v1/stars_large_2_half.png
			res.send(data);
		});
	});
};