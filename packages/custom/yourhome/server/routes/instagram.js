module.exports = function(Yourhome, app, auth, database) {  
	var getJSON = require('get-json');
	app.post('/api/yourhome/instagram', function (req, res)
	{
		if(!req.session || !req.session.user) {
			res.sendStatus(412);
			return;
		}
		var i,j,insta;
		var instaURL ="https://api.instagram.com/v1/users/self/media/recent/?access_token=";
		instaURL += req.session.user.instagram.accessToken;
		//can see own stuff & comments on it & likes on it
		getJSON(instaURL, function(err, response){
			if(err)
			{
				console.log(err);
				
				res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: err}));
			}
			else
			{
				res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: response}));
			}
		});
		
	});
	
	app.post('/api/yourhome/instagramComments', function (req, res)
	{
		var instaURL ="https://api.instagram.com/v1/media/";
		instaURL += req.body.id;
		instaURL += '/comments?access_token=';
		instaURL += req.session.user.instagram.accessToken;
		
		getJSON(instaURL, function(err, response){
			if(err)
			{
				console.log(err);
				res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: err}));
			}
			else
			{
				res.setHeader('content-type', 'application/json');
				res.send(JSON.stringify({json: response, count: req.body.count}));
			}
		});
	});
};