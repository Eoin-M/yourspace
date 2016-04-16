'use strict';

module.exports = {
  db: 'mongodb://mongodb2150me:ra7cyc@danu7.it.nuigalway.ie:8717/mongodb2150',
  debug: true,
  logging: {
    format: 'tiny'
  },
  //  aggregate: 'whatever that is not false, because boolean false value turns aggregation off', //false
  aggregate: false,
  mongoose: {
    debug: false
  },
  hostname: 'http://localhost:8638',
  app: {
    name: 'YourSpace'
  },
  strategies: {
    local: {
      enabled: true
    },
    landingPage: '/',
    facebook: {
      clientID: '1651335318477907',
      clientSecret: '75edeeb21d51f41329679068da6651b7',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/facebook/callback',
      enabled: true
    },
    twitter: {
      clientID: '6oDHVlPjlRdQ2gwGTGDaDdd9P',
      clientSecret: 'pWZW5PD75hBqtUiI4soTAUpWsviwoE4OABious3zGMK7lcnizZ',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/twitter/callback',
      enabled: true
    },
    github: {
      clientID: '907057e905c6bc1eed03',
      clientSecret: 'e88f048611d399f22870ee97f5b7f7cc631787a0',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/github/callback',
      enabled: true
    },
    google: {
      clientID: '665842103894-tfnfp6nfu4k61lohoii4rfdm31oaklot.apps.googleusercontent.com',
      clientSecret: 'ZSqLk87AJ84QQ8v4ysXq2BYU',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/google/callback',
      enabled: true
    },
	reddit: {
      clientID: 'rtlsgUdpnuveqw',
      clientSecret: 'HRxbyK8jijihA-oy3A_3vx7OP84',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/reddit/callback',
      enabled: true
    },
	instagram: {
      clientID: 'b8de0956d52345deaf7695de7231372a',
      clientSecret: '975215106b6741928b8c4ab0fcaf3b8c',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/instagram/callback',
      enabled: true
    },
    linkedin: {
      clientID: 'DEFAULT_API_KEY',
      clientSecret: 'SECRET_KEY',
      callbackURL: 'http://danu7.it.nuigalway.ie:8638/api/auth/linkedin/callback',
      enabled: false
    }
  },
  weather: 'http://api.wunderground.com/api/3db9db7515033481/forecast/q/',
  emailFrom: 'YourSpace <yourspaceweb@gmail.com>',
  mailgun: 'api:key-cc78ec5f7daafb37354e0912bd177b01',
  secret: 'seanisdaboss'
};

