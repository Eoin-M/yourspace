'use strict';

var mongoose = require('mongoose'),
  LocalStrategy = require('passport-local').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  GitHubStrategy = require('passport-github').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  RedditStrategy = require('passport-reddit').Strategy,
  LinkedinStrategy = require('passport-linkedin').Strategy,
  refresh = require('passport-oauth2-refresh'),
  User = mongoose.model('User'),
  tempUser = mongoose.model('tempUser'),
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
      tempUser.findOne({
        email: email
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!tempUser) {
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
	  email: true
    },
    function(token, tokenSecret, profile, done) {
		console.log("Twitter");
		profile._json.token = token;
		profile._json.tokenSecret = tokenSecret;
      User.findOne({
        email: profile._json.email
      }, function(err, user) {
        if (err) {
			console.log(err);
          return done(err);
        }
        if (user) {
			if(user.twitter == null)
			{
				user.twitter = profile._json;
				user.save(function(err) {
				  if (err) {
					console.log(err);
					return done(null, false, {message: 'Twiter login failed, email already used by other login strategy'});
				  } else {
					return done(err, user);
				  }
				});
			}
          return done(err, user);
        }
        user = new User({
          name: profile.displayName,
		  email: profile._json.email,
          username: profile.username,
		  imgsrc: profile._json.profile_image_url,
          providers: ['twitter'],
          twitter: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
            return done(null, false, {message: 'Twitter login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));

  // Use facebook strategy
  passport.use(new FacebookStrategy({
      clientID: config.strategies.facebook.clientID,
      clientSecret: config.strategies.facebook.clientSecret,
      callbackURL: config.strategies.facebook.callbackURL,
	  profileFields: ['id', 'displayName', 'emails']
    },
    function(accessToken, refreshToken, profile, done) {
		console.log("Facebook");
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		debugger
      User.findOne({
        email: profile.emails[0].value
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
			if(user.facebook == null)
			{
				user.facebook = profile._json;
				user.save(function(err) {
				  if (err) {
					console.log(err);
					return done(null, false, {message: 'Facebook login failed, email already used by other login strategy'});
				  } else {
					return done(err, user);
				  }
				});
			}
          return done(err, user);
        }
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.username || profile.emails[0].value.split('@')[0],
		  imgsrc: "https://graph.facebook.com/" + profile._json.id + "/picture?type=square",
          providers: ['facebook'],
          facebook: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
            return done(null, false, {message: 'Facebook login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));

  // Use github strategy
  passport.use(new GitHubStrategy({
      clientID: config.strategies.github.clientID,
      clientSecret: config.strategies.github.clientSecret,
      callbackURL: config.strategies.github.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
		console.log("Github");
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
      User.findOne({
        email: profile.emails[0].value
      }, function(err, user) {
		if (err) {
          return done(err);
        }
        if (user) {
			if(user.github == null)
			{
				user.github = profile._json;
				user.save(function(err) {
				  if (err) {
					console.log(err);
					return done(null, false, {message: 'Github login failed, email already used by other login strategy'});
				  } else {
					return done(err, user);
				  }
				});
			}
          return done(err, user);
        }
        user = new User({
	  name: profile._json.displayName || profile._json.login,
          username: profile._json.login,
          email: profile.emails[0].value,
		  imgsrc: profile._json.avatar_url,
          providers: ['github'],
          github: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
            return done(null, false, {message: 'Github login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));

  // Use google strategy
  var googleStrategy = new GoogleStrategy({
      clientID: config.strategies.google.clientID,
      clientSecret: config.strategies.google.clientSecret,
      callbackURL: config.strategies.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
      User.findOne({
        email: profile.emails[0].value
      }, function(err, user) {
        if (user) {
			user.google = profile._json;
			user.save(function(err) {
			  if (err) {
				console.log(err);
				return done(null, false, {message: 'Google login failed, email already used by other login strategy'});
			  } else {
				return done(err, user);
			  }
			});
          return done(err, user);
        }
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
		  imgsrc: profile._json.image.url,
          providers: ['google'],
          google: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {			  
			debugger
            console.log(err);
            return done(null, false, {message: 'Google login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
    }
  );
  
  passport.use(googleStrategy);
  refresh.use(googleStrategy);
  
  // Use reddit strategy
  passport.use(new RedditStrategy({
      clientID: config.strategies.reddit.clientID,
      clientSecret: config.strategies.reddit.clientSecret,
      callbackURL: config.strategies.reddit.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
		profile._json.accessToken = accessToken;
		profile._json.refreshToken = refreshToken;
		console.log(profile);
		debugger
      User.findOne({
        'reddit.id': profile.id
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(err, user);
        }
        user = new User({
          name: profile.name,
          //email: profile.emails[0].value,
          username: profile.name,
          providers: 'reddit',
          reddit: profile._json,
          roles: ['authenticated']
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
            return done(null, false, {message: 'Reddit login failed, email already used by other login strategy'});
          } else {
            return done(err, user);
          }
        });
      });
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
};
