'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

module.exports = function(Profile, app, auth, database) {

  app.post('/api/profile/save', function(req, res){
	  req.session.user = req.body.user;
	  
	  var user = new User(req.body.user);
	  User.remove({ _id: user._id }, function(err) {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			else {
			  user.save(function(err) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
				else return res.sendStatus(200);
			  });
			}
	  });
  });
  
  app.post('/api/profile/delete', function(req, res){
	   User.remove({ _id: req.session.user._id }, function(err) {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			else {
				return res.sendStatus(200);
			}
	  });
  });
};
