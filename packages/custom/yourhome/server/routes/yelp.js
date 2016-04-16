module.exports = function(Yourhome, app, auth, database) {  

//*****************Yelp********************

var Yelp = require("yelp");
var yelp = new Yelp  ({
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
	
	console.dir(location);
	
	yelp.search({term: term, location: location}, function(error, data) {
		if(error){		
			console.log(error);
		}
		res.send(data);
	});
});
	
};