'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  TempUser = mongoose.model('tempUser'),
  nev = require('email-verification')(mongoose),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken

nev.configure({
    verificationURL: 'http://danu7.it.nuigalway.ie:8638/email-verification/${URL}',
    persistentUserModel: User,
    tempUserModel: TempUser,

    transportOptions: {
        service: 'Gmail',
		port: 995,
        auth: {
            user: 'yourspaceweb@gmail.com',
            pass: 'yourpassword'
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <yourspaceweb@gmail.com>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
});  
  
/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
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
			//console.log(req.session.user);
			//console.log(req.user);
			if (req.session.user != null) {
				req.user = req.session.user;
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
			console.log("----Create----");
            var tempUser = new TempUser(req.body);

			var nodemailer = require('nodemailer');

			// create reusable transporter object using SMTP transport
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				port: 995,
				auth: {
					user: 'yourspaceweb@gmail.com',
					pass: 'yourpassword'
				}
			});

			// NB! No need to recreate the transporter object. You can use
			// the same transporter object for all e-mails

			// setup e-mail data with unicode symbols
			var mailOptions = {
				from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
				to: 'eoin.mgr@gmail.com', // list of receivers
				subject: 'Hello ✔', // Subject line
				text: 'Hello world ✔', // plaintext body
				html: '<b>Hello world ✔</b>' // html body
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: ' + info.response);

			});
			
			var sendmail = require('sendmail')();

			sendmail({
				from: 'no-reply@yourspace.com',
				to: 'eoin.mgr@gmail.com',
				subject: 'test sendmail',
				content: 'Mail of test sendmail ',
			  }, function(err, reply) {
				console.log(err && err.stack);
				console.dir(reply);
			});
			
            tempUser.provider = 'local';

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
			console.log(tempUser);

            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            tempUser.roles = ['authenticated'];
            /*tempUser.save(function(err) {
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
                }*/
				console.log("Top");
				nev.createTempUser(tempUser, function(err, newTempUser) {
					console.log("In");
					if (err) console.log(err);

					// a new user
					if (newTempUser) {
						console.log("In 2");
						var URL = newTempUser[nev.options.URLFieldName];
						console.log(email);
						console.log(URL);
						nev.sendVerificationEmail(email, URL, function(err, info) {
							if (err) console.log(err);
							else console.log("Temp User Saved!");

							// flash message of success
						});

					// user already exists in our temporary OR permanent collection
					} else {
						console.log("Error");
					}
				});
				console.log("Bottom");
				
                var payload = tempUser;
                payload.redirect = req.body.redirect;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                req.logIn(tempUser, function(err) {
                    if (err) { return next(err); }

                    MeanUser.events.publish({
                        action: 'created',
                        tempUser: {
                            name: req.user.name,
                            username: tempUser.username,
                            email: tempUser.email
                        }
                    });

                    // We are sending the payload inside the token
                    var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
                    res.json({ 
                      token: token,
                      redirect: config.strategies.landingPage
                    });
                });
                res.status(200);
            
        },
        /**
         * Send User
         */
        me: function(req, res) {
			console.log("----User Me----");
			if (req.session.user != null) req.user = req.session.user;
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
                res.json({ token: token });
               
            });
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
                        return res.send({
                            user: user
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
                        $or: [{
                            email: req.body.text
                        }, {
                            username: req.body.text
                        }]
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

