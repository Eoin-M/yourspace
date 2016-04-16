'use strict';

var mongoose = require('mongoose'),
  LocalStrategy = require('passport-local').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  GitHubStrategy = require('passport-github').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  RedditStrategy = require('passport-reddit').Strategy,
  InstagramStrategy = require('passport-instagram').Strategy,
  LinkedinStrategy = require('passport-linkedin').Strategy,
  refresh = require('passport-oauth2-refresh'),
  User = mongoose.model('User'),
  config = require('meanio').loadConfig();
  
module.exports = function(passport) {
  // Serialize the user id to push into the session
  
  passport.serializeUser(function(user, done) {
	  console.log("Serialize");
    done(null, user.id);
  });

  // Deserialize the user object based on a pre-serialized token
  // which is the user id
  passport.deserializeUser(function(id, done) {
	  console.log("Deserialize");
    User.findOne({
      _id: id
    }, '-salt -hashed_password', function(err, user) {
		console.log("Deserialize");
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({
        email: email, providers: 'local'
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!User) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        return done(null, user);
      });
    }
  ));

  // Use twitter strategy
  passport.use(new TwitterStrategy({
      consumerKey: config.strategies.twitter.clientID,
      consumerSecret: config.strategies.twitter.clientSecret,
      callbackURL: config.strategies.twitter.callbackURL,
	  email: true,
	  passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
		profile.email = (req.session && req.session.user) ? req.session.user.email : profile._json.email;
		profile._json.token = token;
		profile._json.tokenSecret = tokenSecret;
		profile._json.displayName = '@' + profile._json.screen_name;
		profile._json.imgsrc = profile._json.profile_image_url;
		
		var baseUser = {
			name: profile.displayName,
			email: profile._json.email,
			username: profile.username,
			imgsrc: profile._json.profile_image_url
		};
		
		passportSet(req, baseUser, 'twitter', profile._json, done);
    }
  ));

  // Use facebook strategy
  passport.use(new FacebookStrategy({
      clientID: config.strategies.facebook.clientID,
      clientSecret: config.strategies.facebook.clientSecret,
      callbackURL: config.strategies.facebook.callbackURL,
	  profileFields: ['id', 'displayName', 'emails'],
	  passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
		profile.email = (req.session && req.session.user) ? req.session.user.email : profile.emails[0].value;
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		profile._json.displayName = profile._json.name;
		profile._json.imgsrc = "https://graph.facebook.com/" + profile._json.id + "/picture?type=square";
		
		var baseUser = {
			name: profile.displayName,
			email: profile.emails[0].value,
			username: profile.username || profile.emails[0].value.split('@')[0],
			imgsrc: "https://graph.facebook.com/" + profile._json.id + "/picture?type=square"
		};
		
		passportSet(req, baseUser, 'facebook', profile._json, done);
    }
  ));

  // Use github strategy
  passport.use(new GitHubStrategy({
      clientID: config.strategies.github.clientID,
      clientSecret: config.strategies.github.clientSecret,
      callbackURL: config.strategies.github.callbackURL,
	  passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
		profile.email = (req.session && req.session.user) ? req.session.user.email : profile.emails[0].value;
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		profile._json.displayName = profile._json.login;
		profile._json.imgsrc = profile._json.avatar_url;
		
		var baseUser = {
			name: profile._json.displayName || profile._json.login,
			username: profile._json.login,
			email: profile.emails[0].value,
			imgsrc: profile._json.avatar_url
		};
		
		passportSet(req, baseUser, 'github', profile._json, done);
    }
  ));

  // Use google strategy
  var googleStrategy = new GoogleStrategy({
      clientID: config.strategies.google.clientID,
      clientSecret: config.strategies.google.clientSecret,
      callbackURL: config.strategies.google.callbackURL,
	  passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
		profile.email = (req.session && req.session.user) ? req.session.user.email : profile.emails[0].value;
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		profile._json.displayName = profile._json.displayName;
		profile._json.imgsrc = profile._json.image.url;
		
		var baseUser = {
			name: profile.displayName,
			first_name: profile._json.name.givenName,
			last_name: profile._json.name.familyName,
			email: profile.emails[0].value,
			username: profile.emails[0].value,
			imgsrc: profile._json.image.url,
		};
		
		passportSet(req, baseUser, 'google', profile._json, done);
    }
  );
  
  passport.use(googleStrategy);
  refresh.use(googleStrategy);
  
  // Use reddit strategy
  passport.use(new RedditStrategy({
      clientID: config.strategies.reddit.clientID,
      clientSecret: config.strategies.reddit.clientSecret,
      callbackURL: config.strategies.reddit.callbackURL,
	  passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		profile._json.displayName = profile._json.name;
		
		var baseUser = {
			name: profile.name,
			email: '@reddit+' + profile._json.id,
			username: profile.name
		};
		
		passportSet(req, baseUser, 'reddit', profile._json, done);
    }
  ));
  
	// Use instagram strategy  
	passport.use(new InstagramStrategy({
      clientID: config.strategies.instagram.clientID,
      clientSecret: config.strategies.instagram.clientSecret,
      callbackURL: config.strategies.instagram.callbackURL,
	  passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
		profile._json = profile._json.data;
		profile.email = (req.session && req.session.user) ? req.session.user.email : '@instagram+' + profile._json.id;
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		profile._json.displayName = profile._json.username;
		
		var baseUser = {
			name: profile._json.username,
			email: '@instagram+' + profile._json.id,
			username: profile._json.username
		};
		
		passportSet(req, baseUser, 'instagram', profile._json, done);
    }
  ));

  // use linkedin strategy
  passport.use(new LinkedinStrategy({
      consumerKey: config.strategies.linkedin.clientID,
      consumerSecret: config.strategies.linkedin.clientSecret,
      callbackURL: config.strategies.linkedin.callbackURL,
      profileFields: ['id', 'first-name', 'last-name', 'email-address']
    },
    function(accessToken, refreshToken, profile, done) {
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
      User.findOne({
        'linkedin.id': profile.id
      }, function(err, user) {
        if (user) {
          return done(err, user);
        }
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
          providers: 'linkedin',
          linkedin: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
            return done(null, false, {message: 'LinkedIn login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));
  
  return passport;
  
	function passportSet(req, baseUser, provider, profile, done) {
		if(!baseUser.first_name || !baseUser.last_name) {
			var nameSplit = baseUser.name.split(' ');
			baseUser.first_name = nameSplit.shift();
			baseUser.last_name = nameSplit.join(' ');
		}
		if(profile.imgsrc == null) profile.imgsrc = '/theme/assets/img/pineapple.png';
		var query = {};
		query[provider + '.id'] = profile.id;
		
		User.findOne(query, function(err, user) {
			if (err) {
			  return done(err);
			}
			if (user) {
				if (req.session && req.session.user){
					User.findOne({
						_id: req.session.user._id
					}, function(err, user2) {
						if (err) {
							return done(err);
						}
						if (user2) {
							console.log('----Snag----');
							user2.snag = user;
							user2.save(function(err) {
								if (err) {
									console.log(err);
									return done(null, false, {message: provider + ' login failed while saving snag'});
								} else {
									return done(err, user2);
								}
							});
						}
					});
				}
				else {
					if(user[provider] == null) {
						user[provider] = profile;
						user.save(function(err) {
							if (err) {
								console.log(err);
								return done(null, false, {message: provider + ' login failed, email already used by other login strategy'});
							} else {
								return done(err, user);
							}
						});
					}
					return done(err, user);
				}
			} else {
				if (req.session && req.session.user){
					User.findOne({
						_id: req.session.user._id
					}, function(err, user2) {
						if (err) {
							return done(err);
						}
						if (user2) {
							user2[provider] = profile;
							user2.providers.push(provider);
							user2.save(function(err) {
								if (err) {
									console.log(err);
									return done(null, false, {message: provider + ' login failed, email already used by other login strategy'});
								} else {
									return done(err, user2);
								}
							});
						}
					});
				} else {
					if(baseUser.imgsrc == null) baseUser.imgsrc = '/theme/assets/img/pineapple.png';
					user = new User({
					  name: baseUser.name,
					  first_name: baseUser.first_name,
					  last_name: baseUser.last_name,
					  email: baseUser.email,
					  username: baseUser.username,
					  imgsrc: baseUser.imgsrc,
					  providers: provider,
					  roles: ['authenticated']
					});
					user[provider] = profile;
					user.save(function(err) {
						if (err) {
							console.log(err);
							return done(null, false, {message: provider + ' login failed, email already used by other login strategy'});
						} else {
							return done(err, user);
						}
					});
				}
			}
		});
	}
};
