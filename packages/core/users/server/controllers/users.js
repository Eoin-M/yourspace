'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  request = require('request'),
  crypto = require('crypto'),
  templates = require('../template'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
	console.log(mailOptions);
	var api_key = config.mailgun;			
	var authR = 'Basic ' + new Buffer(api_key).toString('base64');
	
    request({
		url: 'https://' + api_key + '@api.mailgun.net/v3/eoinmaguire.com/messages',
		method: 'POST',
		headers: {
			'Authorization': authR
		},
		qs: mailOptions
	}, function(error, response, body){
		console.log(body);
		return body;
	});
	return null;
}

module.exports = function(MeanUser) {
    return {
        /**
         * Auth callback
         */
        authCallback: function(req, res) {
			console.log("----Auth Callback----");
			req.session.user = req.user;
          var payload = req.user;
          var escaped = JSON.stringify(payload); 
          escaped = encodeURI(escaped);
          // We are sending the payload inside the token
          var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
          res.cookie('token', token);
          var destination = config.strategies.landingPage;
          if(!req.cookies.redirect)
            res.cookie('redirect', destination);
          res.redirect(destination);
        },

        /**
         * Show login form
         */
        signin: function(req, res) {
			req.login();
			console.log(req.isAuthenticated());
			console.log("----Sign-in----");
          if (req.user.roles[0] == 'authenticated') {
			console.log("----Sign-in Authenticated----");
            return res.redirect('/');
          }
          res.redirect('/login');
        },

        /**
         * Logout
         */
        signout: function(req, res) {
			console.log("----Sign-out----");
			if (req.session.user != null) {
				req.session.destroy();
			}
			if (req.user != null){
				MeanUser.events.publish({
					action: 'logged_out',
					user: {
						name: req.user.name
					}
				});
			}
            req.logout();
            res.redirect('/');
        },

        /**
         * Session
         */
        session: function(req, res) {
			console.log("----Session------");
          res.redirect('/');
        },

        /**
         * Create user
         */
        create: function(req, res, next) {
			console.log('----CREATE----');
			
            var user = new User(req.body);

            user.provider = 'local';
			user.verified = false;

            // because we set our user.provider to local our models/user.js validation will always be true
            req.assert('name', 'You must enter a name').notEmpty();
            req.assert('email', 'You must enter a valid email address').isEmail();
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
			var nameSplit = user.name.split(' ');
			user.first_name = nameSplit.shift();
			user.last_name = nameSplit.join(' ');
			user.local = {};
			user.local.displayName = user.username;
			user.local.imgsrc = '/theme/assets/img/pineapple.png';
			
            user.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                        res.status(400).json([{
                            msg: 'Username already taken',
                            param: 'username'
                        }]);
                        break;
                        default:
                        var modelErrors = [];

                        if (err.errors) {

                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }

                            res.status(400).json(modelErrors);
                        }
                    }
                    return res.status(400);
                }				

				req.session.user = user;
				
				 var mailOptions = {
					to: user.email,
					from: config.emailFrom
				};
					
				mailOptions = templates.verify_email(user, req, user._id, mailOptions);
				sendMail(mailOptions);
				
                /*var payload = user;
                payload.redirect = req.body.redirect;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);*/
                req.logIn(user, function(err) {
                    if (err) { return next(err); }

                    MeanUser.events.publish({
                        action: 'created',
                        user: {
                            name: req.user.name,
                            username: user.username,
                            email: user.email
                        }
                    });

                    // We are sending the payload inside the token
                    /*var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
                    res.json({ 
                      token: token,
                      redirect: config.strategies.landingPage
                    });*/
					res.send({user: req.session.user, redirect: config.strategies.landingPage});
                });
                res.status(200);
            });
        },
		
		verify: function(req, res, next) {
			console.log('----VERIFY----');
            User.findOne({
                _id: req.params.token,
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        msg: 'Token invalid or expired'
                    });
                }
				user.verified = true;
                user.save(function(err) {

                    MeanUser.events.publish({
                        action: 'verified',
                        user: {
                            name: user.name
                        }
                    });

                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        return res.send({
                            user: user
                        });
                    });
                });
            });
        },
		
        /**
         * Send User
         */
        me: function(req, res) {
			console.log("----User Me----");
			if(!req.session || !req.session.user) return res.send(null);
			
			User.findOne({
                _id: req.session.user._id
            }).exec(function(err, user) {
                if (err) {
					console.log(err);
					res.send(null);
					return;
				}
                if (!user) {
					console.log('Failed to load User ' + req.session.user.email);
					res.send(null);
					return;
				}
				console.dir(user);
				req.session.user = user;
				res.send(JSON.stringify({user: user}));
				return;
            });
			/*if (req.session.user != null) req.user = req.session.user;
            if (!req.user || !req.user.hasOwnProperty('_id')) return res.send(null);
			console.log("----User Me2----");
            User.findOne({
                _id: req.user._id
            }).exec(function(err, user) {

                if (err || !user) return res.send(null);
				console.log("----User Me3----");

                var dbUser = user.toJSON();
                var id = req.user._id;

                delete dbUser._id;
                delete req.user._id;

                var eq = _.isEqual(dbUser, req.user);
                if (eq) {
                    req.user._id = id;
                    return res.json(req.user);
                }

                var payload = user;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
				console.log("----User Me4----");
                res.json({ token: token });*/
            //});
        },

        /**
         * Find user by id
         */
        user: function(req, res, next, id) {
			console.log("----Find User----");
            User.findOne({
                _id: id
            }).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },

        /**
         * Resets the password
         */

        resetpassword: function(req, res, next) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
                req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {

                    MeanUser.events.publish({
                        action: 'reset_password',
                        user: {
                            name: user.name
                        }
                    });

                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        return res.json({
							user: user,
							redirect: config.strategies.landingPage
						  });
                    });
                });
            });
        },

        /**
         * Callback for forgot password link
         */
        forgotpassword: function(req, res, next) {
            async.waterfall([

                function(done) {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function(token, done) {
                    User.findOne({
						email: req.body.text, providers: 'local'
					  }, function(err, user) {
                        if (err || !user) return done(true);
                        done(err, user, token);
                    });
                },
                function(user, token, done) {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
					console.log(mailOptions);
                    sendMail(mailOptions);
                    done(null, user);
                }
            ],
            function(err, user) {

                var response = {
                    message: 'Mail successfully sent',
                    status: 'success'
                };
                if (err) {
                    response.message = 'User does not exist';
                    response.status = 'danger';

                }
                MeanUser.events.publish({
                    action: 'forgot_password',
                    user: {
                        name: req.body.text
                    }
                });
                res.json(response);
            });
        }
    };
}

