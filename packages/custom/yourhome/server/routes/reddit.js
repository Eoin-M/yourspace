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
		getReddit(req, res);
	});
	
	function getReddit(req, res){
		if (req.session && req.session.user && req.session.user.reddit){
			console.log('reddit');
			var r = setupReddit(req);
			
			r.getOAuth(req.body.rUrl, {after: req.body.after, t: req.body.t}, function(err, data, response) {
				if(!err) {
					res.send(JSON.stringify({reddit: formatReddit(data)}));
				}
				else {
					if(err == 401) r.refreshAccessToken(function(err, access_token, response){
						req.session.user.reddit.accessToken = access_token;
						getReddit(req, res);
						saveAccessToken(req, access_token);
					});
					else res.status(err).send(JSON.stringify({err: err}));
				}
			});
		}
		else {
			var r = new Reddit();
			r.get(req.body.rUrl, function(err, data, response){
				if(!err) {
					res.send(JSON.stringify({reddit: formatReddit(data)}));
				}
				else res.status(err).send(JSON.stringify({err: err}));
			});
		}
	}
	
	function saveAccessToken(req, access_token){
		User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"reddit.accessToken": access_token}}, {upsert:false}, function(err, user){
			if (err) console.log(err);
			return;
		});
	}
	
	app.post('/api/yourhome/redditVote', function(req, res){
		
		if (req.session && req.session.user && req.session.user.reddit){
			console.log('redditVote');
			
			var r = setupReddit(req);
			
			r.postOAuth('/api/vote', {id: req.body.id, dir: req.body.dir}, function(err, data, response) {
				//console.log(data);
				res.sendStatus(200);
			});
		}
	});
	
	app.post('/api/yourhome/redditHideOrSave', function(req, res){
		if (req.session && req.session.user && req.session.user.reddit){
			
			var r = setupReddit(req);
			
			r.postOAuth(req.body.rUrl, {id: req.body.id}, function(err, data, response) {
				if(err) {
					res.sendStatus(500);
					console.log(err);
				}
				else res.sendStatus(200);
			});
		}
		else res.sendStatus(401);
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
		if(!reddit || !reddit.data || !reddit.data.children) return reddit;
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
			else if (string < 2592000){
				string = parseInt(string/86400);
				string += ' day';
				if(string != 1)string += "s";
			}
			else if (string < 31104000){
				string = parseInt(string/2592000);
				string += ' month';
				if(string != 1)string += "s";
			}
			else {
				string = parseInt(string/31104000);
				string += ' year';
				if(string != 1)string += "s";
			}
			posts[i].data.created = string;
		}
		reddit.data.children = posts;
		return reddit;
	}
};
