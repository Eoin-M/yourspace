var config = require('meanio').loadConfig();
var socketio = require('socket.io')();

module.exports = function(Yourhome, app, auth, database, http) {
	
	var colors = require('colors/safe');
	var io = socketio.listen(8620);
	var socketIds = [[]];
	var numConnects = 0;
	
	app.post('/api/yourhome/twitterFeed', function(req, res){
		console.log(colors.green("Twitter"));
		//console.log(req.session.user.twitter);
		/*if (req.session && req.session.user && req.session.user.twitter){
			io.sockets.on('connection', function(socket) {

			  // Promote this socket as master
			  socket.on("I'm the master", function() {

				// Save the socket id
				req.session.user.socketId = socket.id;
			  });
			});*/
			
			if(numConnects == 0) {
				numConnects++;
				var Twit = require('twit');

				var T = new Twit({
					consumer_key: config.strategies.twitter.clientID
				  , consumer_secret: config.strategies.twitter.clientSecret
				  , access_token: req.session.user.twitter.token
				  , access_token_secret: req.session.user.twitter.tokenSecret
				});
				
				var stream = T.stream('statuses/filter', { track: ['yourspace', 'yourspacewebapp'] });

				stream.on('tweet', function (tweet) {
					console.log("Tweet");
					var msg = {};
					msg.text = tweet.text;
					msg.media = tweet.entities.media;
					msg.mentions = tweet.entities.user_mentions;
					msg.urls = tweet.entities.urls;
					var screen_name = "@" + tweet.user.screen_name;
					msg.user = {
						id: tweet.user.id,
						name: tweet.user.name,
						screen_name: screen_name,
						img: tweet.user.profile_image_url
					};
					io.sockets.emit('tweets', tweet);
					///console.dir(tweet);
					//console.dir(msg);
					//res.setHeader('Content-Type', 'application/json');
					//res.send(JSON.stringify({tweet: tweet}));
				});
			}
			
			io.sockets.on('connection', function(socket) {
				console.log('Client connected !');
				if (numConnects <= 0) {
					numConnects = 0;
					console.log('First active client. Start streaming from Twitter');
					stream.start();
				}
			 
				numConnects++;
			 
				socket.on('disconnect', function() {
					console.log('Client disconnected !');
					numConnects--;
			 
					if (numConnects <= 0) {
						numConnects = 0;
						console.log("No active client. Stop streaming from Twitter");
						stream.stop();
					}
				});
			});
			//res.sendStatus(200);
		//}
	});
	
	app.post('/api/yourhome/postTweet', function(req, res){
		T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
			console.log(data);
		})
	});
};
