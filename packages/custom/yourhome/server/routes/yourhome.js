'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter

var mongoose = require('mongoose'),
		User = mongoose.model('User');
		
var config = require('meanio').loadConfig();
	
var validator = require('validator');
var geoip = require('geoip-lite');

var geocoderProvider = 'google';
var httpAdapter = 'http';
// optional 
 
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);
		
Array.prototype.unique = function() {
	var a = this.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				a.splice(j--, 1);
		}
	}

	return a;
};
  
	
module.exports = function(Yourhome, app, auth, database) {
  
  app.get('/api/yourhome/deSnag', function(req, res){
		
		User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"snag": null}}, {upsert:false}, function(err, user){
			if (err) console.log(err);
			return;
		});
	  
		res.sendStatus(200);
  });
  
  app.get('/api/yourhome/snagLink', function(req, res){
	  
	User.findOne({
        _id: req.session.user._id
    }, function(err, user) {
		if (err) {
			res.sendStatus(500);
			return;
        }
        if (user) {
			if(user.facebook == null && req.session.user.snag.facebook) {
				user.facebook = req.session.user.snag.facebook;
			}
			if(user.google == null && req.session.user.snag.google) {
				user.google = req.session.user.snag.google;
			}
			if(user.github == null && req.session.user.snag.github) {
				user.github = req.session.user.snag.github;
			}
			if(user.twitter == null && req.session.user.snag.twitter) {
				user.twitter = req.session.user.snag.twitter;
			}
			if(user.reddit == null && req.session.user.snag.reddit) {
				user.reddit = req.session.user.snag.reddit;
			}
			if(user.instagram == null && req.session.user.snag.instagram) {
				user.instagram = req.session.user.snag.instagram;
			}
			
			user.stocks = user.stocks.concat(req.session.user.snag.stocks).unique();
			user.providers = user.providers.concat(req.session.user.snag.providers).unique();
			user.snag = undefined;
			
			user.save(function(err) {
				if (err) {
					res.sendStatus(500);
					return;
				} else {
					res.sendStatus(200);
					return;
				}
			});
		}
    });
	
	User.remove({ _id: req.session.user.snag._id }, function(err) {
		if (err) {
			console.log(err);
		}
		else {
		}
	});
  });
  
  app.post('/api/yourhome/saveModules', function(req, res){
	  User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"modules": req.body.modules}}, {upsert:false}, function(err, user){
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			return res.sendStatus(200);
		});
  });
  
  app.post('/api/yourhome/saveLocation', function(req, res){
	  if(!req.session || !req.session.user) {
		  res.sendStatus(412);
		  return;
	  }
	  
		User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"location": req.body.loc}}, {upsert:false}, function(err, user){
			if (err) console.log(err);
			return;
		});
	  
		res.sendStatus(200);
  });
  
  app.get('/api/yourhome/getLocation', function(req, res){
	var done = false;
		
	var defaultLoc = {
		country: 'United States',
		state: 'California',
		city: 'San Francisco',
		lat: 37.775,
		long: -122.419,
		address: '500 parnassus level 1, San Francisco, CA 94103, USA'
	};
	
	  if(req.session && req.session.user) { //if user is logged in, use they're last saved location
		  if(req.session.user.location){
			  res.send({loc: req.session.user.location});
		  } else {
			  loc2(req, res, defaultLoc);
		  }
	  }
	  else{
		  loc2(req, res, defaultLoc);
	  }
  });
  
  function loc2(req, res, defaultLoc){
	  
	  if(validator.isIP(req.connection.remoteAddress + 'null')){
		  var geo = geoip.lookup(req.connection.remoteAddress);
		  
		  geocoder.reverse({lat:geo.ll[0], lon:geo.ll[1]}, function(err, data) {
			  if(err){
				  console.log('DEFAULT LOC');
				res.send({loc: defaultLoc});
				return;
			  }
			  console.log(data);
				var loc = {
					country: data[0].country,
					state: data[0].state || data[0].city,
					city: data[0].city,
					lat: geo.ll[0],
					long: geo.ll[1],
					address: data[0].formattedAddress
				};
			  
				console.log(loc);
			  
				res.send({loc: loc});
				return;
			});
	    }
		else {
			res.send({loc: defaultLoc});
		}
  }
};
