var config = require('meanio').loadConfig();
var Twit = require('twit');

module.exports = function(Yourhome, app, auth, database, http) {
	
	var colors = require('colors/safe');
	
	app.post('/api/yourhome/postTweet', function(req, res){
		if (req.session && req.session.user && req.session.user.twitter){
			var T = twitterCredentials(req);
			
			T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
				data = parseTweet(req, data);
				if(!err) res.send(JSON.stringify({tweet: data}));
				else if(err) res.sendStatus(400);
			});
		}
		else res.sendStatus(401);
	});
	
	app.post('/api/yourhome/twitterTimeline', function(req, res){
		if (req.session && req.session.user && req.session.user.twitter){
			var T = twitterCredentials(req);
			
			T.get('statuses/home_timeline', function(err, data, response) {
				console.log(data);
				if(!err){
					for(var a = 0; a < data.length; a++){
						data[a].arrayPos = a;
						data[a] = parseTweet(req, data[a]);
					}
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({tweets: data}));
				}
				else res.sendStatus(400);
			});
		}
		else res.sendStatus(401);
	});
	
	function parseTweet(req, tweet){
		if(tweet.user.id == req.session.user.twitter.id) tweet.userTweet = true;
		else tweet.userTweet = false;
		tweet.user.img = tweet.user.profile_image_url;
		var msg = {};
		msg.hashtags = tweet.entities.hashtags;
		if(msg.hashtags.length > 0){
			var anchor1 = "<a target=\"_blank\" href=\"https://twitter.com/hashtag/";
			var anchor2 = "\">#"
			var anchor3 = "</a>";
			for(var i = 0; i < msg.hashtags.length; i++){
				var tweetText = "";
				tweetText += anchor1;
				tweetText += msg.hashtags[i].text;
				tweetText += anchor2;
				tweetText += msg.hashtags[i].text;
				tweetText += anchor3;
				msg.hashtags[i].text = tweetText;
			}
		}
		
		msg.mentions = tweet.entities.user_mentions;
		if(msg.mentions.length > 0){
			var anchor4 = "<a target=\"_blank\" href=\"https://twitter.com/";
			var anchor5 = "\">@"
			var anchor6 = "</a>";
			
			for(var i = 0; i < msg.mentions.length; i++){
				var tweetText = "";
				tweetText += anchor4;
				tweetText += msg.mentions[i].screen_name;
				tweetText += anchor5;
				tweetText += msg.mentions[i].screen_name;
				tweetText += anchor6;
				msg.mentions[i].text = tweetText;
			}
		}
		
		var h = 0;
		var m = 0;
		msg.links = [];
		
		while(h < msg.hashtags.length || m < msg.mentions.length){
			//console.log("h: " + h + " \(" + msg.hashtags.length + "\) m: " + m + " \(" + msg.mentions.length + "\)");
			if(h < msg.hashtags.length){
				if(m == msg.mentions.length){
					msg.links[h+m] = msg.hashtags[h];
					h++;
				}
				else if(msg.hashtags[h].indices[0] < msg.mentions[m].indices[0]){
					msg.links[h+m] = msg.hashtags[h];
					h++;
				}
			}
			if(m < msg.mentions.length){
				if(h == msg.hashtags.length){
					msg.links[h+m] = msg.mentions[m];
					m++;
				}
				else if(msg.mentions[m].indices[0] < msg.hashtags[h].indices[0]){
					msg.links[h+m] = msg.mentions[m];
					m++;
				}
			}
		}
		tweet.links = msg.links;
		if(tweet.links.length > 0){
			var tweetText = tweet.text.substring(0, tweet.links[0].indices[0]);
			for(var i = 0; i < tweet.links.length; i++){
				tweetText += tweet.links[i].text;
				if(i == tweet.links.length - 1) tweetText += tweet.text.substring(tweet.links[i].indices[1], tweet.text.length);
				else tweetText += tweet.text.substring(tweet.links[i].indices[1], tweet.links[i+1].indices[0]);
			}
			tweet.text = tweetText;
		}
		tweet.retweet_count = simplifyNumber(tweet.retweet_count);
		tweet.favorite_count = simplifyNumber(tweet.favorite_count);
		var now = new Date();
		var tweetDate = tweet.created_at.split(' '); //day:s month:s day:i date:s timezone:s year:i
		tweetDate[5] = parseInt(tweetDate[5]);
		var tweetTime = tweetDate[3].split(':'); //hours minutes seconds
		if(tweetDate[5] < now.getFullYear()){
			tweet.created_at = tweetDate[2] + ' ' + tweetDate[1] + ' ' + tweetDate[5];
		}
		else if(parseInt(tweetDate[2]) < now.getDay()){
			tweet.created_at = tweetDate[1] + ' ' + tweetDate[2];
		}
		else if(parseInt(tweetTime[0]) < now.getHours()){
			tweet.created_at = (now.getHours() - parseInt(tweetTime[0])) + 'h';
		}
		else if(parseInt(tweetTime[1]) < now.getMinutes() + 4){
			tweet.created_at = (now.getMinutes() - parseInt(tweetTime[1]) + 5) + 'm';
		}
		else {
			tweet.created_at = 'now';
		}
		return tweet;
	}
	
	function simplifyNumber(n){
		if(n >= 1000000){
			n /= 100000;
			n = Math.floor(n);
			n /= 10;
			n += 'M';
		}
		else if(n >= 1000){
			n /= 100;
			n = Math.floor(n);
			n /= 10;
			n += 'K';
		}
		return n;
	}
	
	function monthToNum(m){
		switch(m){
			case 'Jan': return 0;
			case 'Feb': return 1;
			case 'Mar': return 2;
			case 'Apr': return 3;
			case 'May': return 4;
			case 'Jun': return 5;
			case 'Jul': return 6;
			case 'Aug': return 7;
			case 'Sep': return 8;
			case 'Oct': return 9;
			case 'Nov': return 10;
			case 'Dec': return 11;
		}
		return -1;
	}
	
	app.post('/api/yourhome/twitterReply', function(req, res){
		var T = twitterCredentials(req);
		var tweet = req.body.tweet;
		
		T.post('statuses/update', {in_reply_to_status_id: tweet.id_str, status: '@' + tweet.user.screen_name + ' ' + tweet.reply}, function(err, data, response){
			if(!err) res.send(JSON.stringify({tweet: data}));
			else if(err) res.sendStatus(400);
		});
	});
	
	app.post('/api/yourhome/twitterRetweet', function(req, res){
		var T = twitterCredentials(req);
		
		T.post('statuses/retweet/:id', {id: req.body.id}, function(err, data, response) {
			console.log(colors.green("retweet"));
			console.log(data);
			if(!err) res.sendStatus(200);
			else res.sendStatus(400);
		});
	});
	
	app.post('/api/yourhome/twitterUnretweet', function(req, res){
		var T = twitterCredentials(req);
		
		T.post('statuses/unretweet/:id', {id: req.body.id}, function(err, data, response) {
			console.log(colors.green("unretweet"));
			console.log(data);
			if(!err) res.sendStatus(200);
			else res.sendStatus(400);
		});
	});
	
	app.post('/api/yourhome/twitterDelete', function(req, res){
		var T = twitterCredentials(req);
		
		T.post('statuses/destroy/:id', {id: req.body.id}, function(err, data, response) {
			console.log(colors.green("delete tweet"));
			if(!err) res.sendStatus(200);
			else res.sendStatus(400);
		});
	});
	
	function twitterCredentials(req){
		var T = new Twit({
			consumer_key: config.strategies.twitter.clientID
		  , consumer_secret: config.strategies.twitter.clientSecret
		  , access_token: req.session.user.twitter.token
		  , access_token_secret: req.session.user.twitter.tokenSecret
		});
		
		return T;
	}
};
