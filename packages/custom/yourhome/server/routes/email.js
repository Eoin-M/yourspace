var mongoose = require('mongoose'),
		User = mongoose.model('User'),
		refresh = require('passport-oauth2-refresh');;
		
	var config = require('meanio').loadConfig();
  
	
module.exports = function(Yourhome, app, auth, database) {  
  
	
	//*************Email*******************
	var util = require('util');
	var google = require('googleapis');
	var googleAuth = require('google-auth-library');
	require('colors');

	//var EM_TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
	//var EM_TOKEN_PATH = EM_TOKEN_DIR + 'gmail-nodejs-quickstart.json';
	/*NB: These are the paths to and names of the tokens google gives us to access the client's data
	*They will eventually be gotten from MongoDB when that's working but for now they're stored locally
	*
	*/
	
	function authorize(req, res, callBackFn) {
		console.log("Google Authorize".green);
		if (req.session && req.session.user && req.session.user.google);
		else { res.status(412).send({ error: "No Valid Google Account Found In Cookie" }); return; }
		var OAuth2 = google.auth.OAuth2;
		var oauth2Client = new OAuth2(config.strategies.google.clientID, config.strategies.google.clientSecret, config.strategies.google.callbackURL);

		oauth2Client.setCredentials({
			access_token: req.session.user.google.accessToken,
			refresh_token: req.session.user.google.refreshToken
		});
		callBackFn(oauth2Client, req, res);
	}


	function getNewToken(req, res, callBackFn) {
		refresh.requestNewAccessToken('google', req.session.user.google.refreshToken, function(err, accessToken) {
			if(err || !accessToken) { return; }

			// Save the new accessToken for future use
			console.log("New Access Token".blue)
			req.session.user.google.accessToken = accessToken;
			authorize(req, res, callBackFn);
			
			User.findOne({
				email: req.session.user.email
			}, function(err, user) {
				if (err) {
					console.log(err);
					return;
				}
				if (user) {
				user.google.accessToken = accessToken;
				user.save(function(err) {
					if (err) {
						console.log(err);
						return;
					} else {
						return;
					}
				});
				return;
				}
			});
		});
	}

	function listEmails(auth, req, res) 
	{
		var custEmails = [];
		var gmail = google.gmail('v1');
	   
		gmail.users.messages.list({
			auth: auth,
			userId: 'me',
			labelIds: 'INBOX',
			maxResults: req.body.maxResults,
		}, function(err, response) {
			if (err) 
			{
				console.log('Email not found... The API returned an error: '.red + err);
				if(err.code == 401) getNewToken(req, res, listEmails);
				return;
			}
			var tempObj = {};
			tempObj.auth = true;
			tempObj.link = "";
			custEmails[0] = tempObj;
			
			var messages = response.messages;
			if (messages.length == 0) 
			{
				console.log('No emails found.');
			} 
			else 
			{
				var i = 0;
				var messagesComplete = 0;
				for (i = 0; i < messages.length; i++)
				{
					gmail.users.messages.get(
					{
					  id : messages[i].id,
					  auth: auth,
					  userId : 'me',
					}, 
					function(err, response) 
					{
						if (err) 
						{
							console.log('ln:159 Email error: ' + err);
							messagesComplete++;
							return;
						}
						custEmails[custEmails.length] = response;
						messagesComplete++;
						if (messagesComplete === messages.length)
						{
							returnEmData(custEmails, req, res);
						}
					}
				)}
				
			}
		});
	}
	  
	function returnEmData(emailsAry, req, res)
	{
		//console.log(util.format(emailsAry).yellow);
		res.setHeader('Content-Type', 'application/json');
		res.send(emailsAry);
	} 
		  
	function markAsRead(auth, req, res)
	{
		var gmail = google.gmail('v1');
		console.log(req.body.id);
		gmail.users.messages.modify({
			auth: auth,
			id: req.body.id,
			userId: 'me',
			resource:
				{
					"removeLabelIds": [
						"UNREAD"
					]
				}
			
		}, function(err, response) {
			if (err) 
			{
				console.log('...The API returned an error: '.red + err);
				if(err.code == 401) getNewToken(req, res, markAsRead);
				else {
					res.setHeader('Content-Type', 'application/json');
					res.send(err); }
				return;
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(response);
		});
	}

	function emailStarred(auth, req, res)
	{
		var gmail = google.gmail('v1');
		console.log(req.body.id);
		var add = null, rmv=null;
		if (req.body.add === true)
		{
			add = "STARRED";
		}
		else
		{
			rmv = "STARRED";
		}
		gmail.users.messages.modify({
			auth: auth,
			id: req.body.id,
			userId: 'me',
			resource:
				{
					addLabelIds:[add],
					removeLabelIds: [rmv]
				}
			
		}, function(err, response) {
			if (err) 
			{
				console.log('...The API returned an error: '.red + err);
				if(err.code == 401) getNewToken(req, res, markAsRead);
				else {
					res.setHeader('Content-Type', 'application/json');
					res.send(err);
				}
				return;
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(response);
		});
	}

	function sendEmail(auth, req, res)
	{
		var gmail = google.gmail('v1');
		
		//reference http://stackoverflow.com/questions/25207217/failed-sending-mail-through-google-api-in-nodejs?answertab=active#tab-top
		var email_attributes = [];
		email_attributes.push("To: "+req.body.to);
		email_attributes.push("MIME-Version: 1.0");
		email_attributes.push("Subject: "+req.body.subject);
		email_attributes.push("");
		email_attributes.push(req.body.message +"\r\nSent from Yourspace");
		var email =email_attributes.join("\r\n").trim();

		var base64EncodedEmail = new Buffer(email).toString('base64');
		
		gmail.users.messages.send({
			auth: auth,
			userId: 'me',
			resource: 
			{
				raw: base64EncodedEmail
			}
			
		}, function(err, response) {
			if (err) 
			{
				console.log('...The API returned an error: ' + err);
				if(err.code == 401) getNewToken(req, res, markAsRead);
				else {
					res.setHeader('Content-Type', 'application/json');
					res.send(err);
				}
				return;
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(response);
		});    
	}

	app.post('/api/yourhome/nextEmails', function (req, res)
	{
		console.log("hit");
		authorize(req, res, listEmails);
		/*fs.readFile('client_secret.json', function processClientSecrets(err, content) 
		{
			if (err) 
			{
				console.log('Error loading client secret file: ' + err);
			}
			authorize(req, res, listEmails);
		});*/
		/*var OAuth2 = google.auth.OAuth2;
		var oauth2Client = new OAuth2(config.strategies.google.clientID, config.strategies.google.clientSecret, config.strategies.google.callbackURL);

		// Retrieve tokens via token exchange explained above or set them:
		oauth2Client.setCredentials({
			access_token: req.session.user.google.accessToken,
			refresh_token: req.session.user.google.refreshToken
		});
		//authorize(req, res, listEmails);
		listEmails(oauth2Client, req, res);*/
	});

	app.post('/api/yourhome/sendEmail', function (req, res)
	{
		console.log("hit");
		authorize(req, res, sendEmail);
		/*fs.readFile('client_secret.json', function processClientSecrets(err, content) 
		{
			if (err) 
			{
				console.log('Error loading client secret file: ' + err);
			}
			authorize(req, res, sendEmail);
		});*/
	});

	app.post('/api/yourhome/modifyEmails', function (req, res)
	{
		console.log("hit");
		if(req.body.status === "UNREAD")
		{
			authorize(req, res, markAsRead, null);
		}
		else if(req.body.status === "STARRED")
		{
			authorize(req, res, emailStarred, null);
		}
		/*fs.readFile('client_secret.json', function processClientSecrets(err, content) 
		{
			if (err) 
			{
				console.log('Error loading client secret file: ' + err);
			}
			else if(req.body.status === "UNREAD")
			{
				authorize(req, res, markAsRead, null);
			}
			else if(req.body.status === "STARRED")
			{
				authorize(req, res, emailStarred, null);
			}
		});*/
	});
};