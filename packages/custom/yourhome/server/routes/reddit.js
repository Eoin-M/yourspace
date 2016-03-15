'use strict';

/* jshint -W098 */

var mongoose = require('mongoose'),
		User = mongoose.model('User');
var config = require('meanio').loadConfig();

var request = require('request');
require('colors');

var Reddit = require('reddit-wrap');
	
module.exports = function(Yourhome, app, auth, database) {  
	
	app.post('/api/yourhome/reddit', function(req, res){
		if (req.session && req.session.user && req.session.user.reddit){
			console.log('reddit');
			var r = setupReddit(req);
			
			r.getOAuth('/hot', function(err, data, response) {
				console.log(data);
				if(!err) res.send(JSON.stringify({reddit: formatReddit(data)}));
				else res.send(JSON.stringify({err: err}));
			});
		}
		else {
			var r = new Reddit();
			r.get('/hot', function(err, data, response){
				console.log(data);
				if(!err) res.send(JSON.stringify({reddit: formatReddit(data)}));
				else res.send(JSON.stringify({err: err}));
			});
		}
	});
	
	app.post('/api/yourhome/redditVote', function(req, res){
		
		if (req.session && req.session.user && req.session.user.reddit){
			console.log('redditVote');
			
			var r = setupReddit(req);
			
			r.postOAuth('/api/vote', {id: req.body.id, dir: req.body.dir}, function(err, data, response) {
				console.log(data);
				res.sendStatus(200);
			});
		}
	});
	
	function setupReddit(req){
		var r = new Reddit({
			consumer_key: config.strategies.reddit.clientID
		  , consumer_secret: config.strategies.reddit.clientSecret
		  , access_token: req.session.user.reddit.accessToken
		  , refresh_token: req.session.user.reddit.refreshToken
		});
			
		return r;
	}
	
	function formatReddit(reddit){
		var posts = reddit.data.children;
		for(var i = 0; i < posts.length; i++){
			var string = Math.floor(Date.now() / 1000) - posts[i].data.created_utc;
			if(string < 60){
				string = parseInt(string);
				string += ' second';
				if(string != 1)string += "s";
			}
			else if (string < 3600){
				string = parseInt(string/60);
				string += ' minute';
				if(string != 1)string += "s";
			}
			else if(string < 86400){
				string = parseInt(string/3600);
				string += ' hour';
				if(string != 1)string += "s";
			}
			else if (string < 25922000){
				string = parseInt(string/86400);
				string += ' day';
				if(string != 1)string += "s";
			}
			else if (string < 77760000){
				string = parseInt(string/25922000);
				string += ' month';
				if(string != 1)string += "s";
			}
			else {
				string = parseInt(string/77760000);
				string += ' year';
				if(string != 1)string += "s";
			}
			posts[i].data.created = string;
		}
		reddit.data.children = posts;
		return reddit;
	}
	
	function getNewToken(req, res) {
		var authR = 'Basic ' + new Buffer(config.strategies.reddit.clientID + ':' + config.strategies.reddit.clientSecret).toString('base64');
		request({
			url: 'https://ssl.reddit.com/api/v1/access_token',
			method: 'POST',
			headers: {
				'Authorization': authR
			},
			body: 'grant_type=refresh_token&refresh_token=' + req.session.user.reddit.refreshToken,
			params: {
				'state': ' ',
				'scope': 'identity',
				'client_id': config.strategies.reddit.clientID,
				'redirect_uri': config.strategies.reddit.callbackURL
			}
		}, function(error, response, body){
			if(!error) console.log("No Error".green)
			// Save the new accessToken for future use
			console.log("New Access Token".blue)
			var accessToken = body.access_token; //not yet tested at all
			req.session.user.reddit.accessToken = accessToken;
			
			User.findOne({
				email: req.session.user.email
			}, function(err, user) {
				if (err) {
					console.log(err);
					return;
				}
				if (user) {
				user.reddit.accessToken = accessToken;
				user.save(function(err) {
					if (err) {
						console.log(err);
						return;
					} else {
						return;
					}
				});
				return;
				}
			});
		});

		/*// Save the new accessToken for future use
		console.log("New Access Token".blue)
		req.session.user.reddit.accessToken = accessToken;
		
		User.findOne({
			email: req.session.user.email
		}, function(err, user) {
			if (err) {
				console.log(err);
				return;
			}
			if (user) {
			user.reddit.accessToken = accessToken;
			user.save(function(err) {
				if (err) {
					console.log(err);
					return;
				} else {
					return;
				}
			});
			return;
			}
		});*/
	}
};
