var request = require('request');

// config values required for app-only auth
var required_for_app_auth = [
  'consumer_key',
  'consumer_secret'
];

// config values required for user auth (superset of app-only auth)
var required_for_user_auth = required_for_app_auth.concat([
  'access_token',
  'access_token_secret'
]);

var Reddit = function(){
	if (!(this instanceof Reddit)) {
    return new Reddit(config);
  }

  var self = this
  var credentials = {
    consumer_key        : config.consumer_key,
    consumer_secret     : config.consumer_secret,
    // access_token and access_token_secret only required for user auth
    access_token        : config.access_token,
    access_token_secret : config.access_token_secret,
    // flag indicating whether requests should be made with application-only auth
    app_only_auth       : config.app_only_auth,
  }
  console.log('REDDIT!');
  this.config = config;
}

module.exports = Reddit;