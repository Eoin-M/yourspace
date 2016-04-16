'use strict';

/**
 * Module dependencies.
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');

/**
 * Validations
 */
  // If you are authenticating by any of the oauth strategies, don't validate.
var validatePresenceOf = function(value) {
  return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function(value, callback) {
  var User = mongoose.model('User');
  User.find({
    $and: [{
      email: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, user) {
    callback(err || user.length === 0);
  });
};

/**
 * Getter
 */
var escapeProperty = function(value) {
  return _.escape(value);
};

/**
 * User Schema
 */

var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    get: escapeProperty
  },
  first_name: {
	  type: String
  },
  last_name: {
	  type: String
  },
  email: {
    type: String,
    required: false, //was true but Twitter does not return an email address sometimes, reddit and instagram never do
    //unique: true,
    // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
    //match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    //validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },
  username: {
    type: String,
    unique: true,
    required: true,
    get: escapeProperty
  },
  verified: {
	type: Boolean,
	default: true
  },
  imgsrc: {
	type: String,
	default: '/theme/assets/img/pineapple.png'
  },
  roles: {
    type: Array,
    default: ['authenticated', 'anonymous']
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank']
  },
  providers: {
    type: [String],
    default: 'local'
  },
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  local: {},
  profile: {},
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  reddit: {},
  instagram: {},
  linkedin: {},
  snag: {},
  rss: {
	  defaultURL: {
		  type: String,
		  default: "http://feeds.bbci.co.uk/news/rss.xml"
	  }
  },
  stocks: {
	  type: [String],
	  default: ['GOOG','AAPL']
  },
  weather: {
	  type: Boolean,
	  default: true
  },
  location: {},
  modules:{
	  type: Array,
	  default: [
		{
			include: 'rss',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 0
		},
		
		{
			include: 'reddit',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 1
		},
		
		{
			include: 'twitter',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 2
		},
		
		{
			include: 'stocks',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 3
		},
		
		{
			include: 'weather',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 4
		},
		
		{
			include: 'calendar',
			class: "col-lg-3 col-md-4 col-sm-6 col-xs-12",
			visible: true,
			position: 5
		},
		
		{
			include: 'yelp',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 6
		},
		
		{
			include: 'jobs',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 7
		},
		
		{
			include: 'instagram',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 8
		},
		
		{
			include: 'email',
			class: 'col-lg-6 col-md-8 col-sm-6 col-xs-12',
			visible: true,
			position: 9
		},
		
		{
			include: 'search',
			class: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
			visible: true,
			position: 10
		}	
	  ]
  }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function() {
  return this._password;
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    var roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * Hide security sensitive fields
   * 
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    var obj = this.toObject();
    delete obj.hashed_password;
    delete obj.salt;
    return obj;
  }
};

mongoose.model('User', UserSchema);
