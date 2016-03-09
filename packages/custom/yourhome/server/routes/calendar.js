//Reference: https://developers.google.com/google-apps/calendar/quickstart/nodejs
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events for events (colourID...)
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events/list for choosing what day etc.

var mongoose = require('mongoose'),
		User = mongoose.model('User'),
		refresh = require('passport-oauth2-refresh');;
		
	var config = require('meanio').loadConfig();

"use strict";
module.exports = function(Yourhome, app, auth, database) {  

	var util = require('util');

	var google = require('googleapis');
	var googleAuth = require('google-auth-library');
	require('colors');

	var CAL_TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
	var CAL_TOKEN_PATH = CAL_TOKEN_DIR + 'calendar-nodejs-quickstart.json';
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
			if(err || !accessToken) { console.log("ERROR".red); return; }

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

	function listEvents(auth, req, res) 
	{
	   debugger;
	   var calendar = google.calendar('v3');
	   var custEvents = [];//the array we'll eventually be returning to the browser
	   calendar.calendarList.list(
	   {
		auth: auth
	   }, function(err, response) {
			if (err) 
			{
				console.log('Calendar not found... The API returned an error: '.red + err);
				if(err.code == 401) getNewToken(req, res, listEvents);
				return;
			}
			var tempObj = {};
			tempObj.auth = true;
			tempObj.link = "";
			custEvents[0] = tempObj;
			
			var calendars = response.items;
			if (calendars.length == 0) 
			{
				console.log('No calendars found.');
			} 
			else 
			{
				//.log(calendars);
				var i = 0;
				var calComplete = 0;
				//console.log("Cal length "+calendars.length);
				for (i = 0; i < calendars.length; i++)
				{
					//console.log(calendars[i].id);
					//console.log("Calendar "+i+calendars[i].summary);
					calendar.events.list(
					{
					  auth: auth,
					  calendarId: calendars[i].id,
					  timeMin: (new Date()).toISOString(),//today is the min date
					  maxResults: req.body.numEvents,//number of events returned
					  singleEvents: true,
					  orderBy: 'startTime'
					}, 
					function(err, response) 
					{
						if (err) 
						{
							console.log('ln:159 Calendar error: ' + err);
							calComplete++;
							return;
						}
					  
						var events = response.items;
						if (events != null)
						{
							for (var j = 0; j < events.length; j++) 
							{
								var eventObj = {};
								var event = events[j];
								//console.log("EVENTS===" +events[j]);
								eventObj.start = new Date(event.start.dateTime || event.start.date);
								eventObj.end = new Date(event.end.dateTime || event.end.date);
								var timeDiff = Math.abs(eventObj.end.getTime() - eventObj.start.getTime());
								eventObj.diff = Math.ceil(timeDiff / (1000 * 60));
								eventObj.description = event.summary;
								if (event.colorId == null)
								{
									event.colorId='-1';
								}
								if (event.location == null)
								{
									event.location=false;
								}
								eventObj.colorID = event.colorId;
								eventObj.location = event.location;
								eventObj.link = event.htmlLink;
								custEvents[custEvents.length] = eventObj;
								
								
								//console.log(eventObj);
							}
							if (j ==0)
							{
								console.log("ln 204 No events were in calendar "+calendars[i]);
							}
							calComplete++;
						}
						else
						{
							calComplete++;
							console.log("No events in calendar "+response);
						}
						if (calComplete == calendars.length)
						{
							returnCalData(custEvents, req, res, req.body.numEvents);
						}
					}
				)}
			}
		});
	}
	  
	  
	function returnCalData(eventsAry, req, res, numEvents)
	{
		var authObj = eventsAry.splice(0,1);
		eventsAry.sort(function (a, b) {
		if (a.start > b.start) {
			return 1;
		}
		if (a.start < b.start) {
			return -1;
		}
		// a must be equal to b
		return 0;
		});
		eventsAry = eventsAry.splice(0,numEvents);
		eventsAry.unshift(authObj[0]);
		console.log(util.format(eventsAry).yellow);
		res.setHeader('Content-Type', 'application/json');
		res.send(eventsAry);
	} 
		  
	function saveEvent(auth, req, res)
	{
		var calendar = google.calendar('v3');
		console.log(req.body.from);
		console.log(req.body.until);
		console.log(req.body.summary);
		console.log(req.body.location);
		var event = 
		{
			summary: req.body.summary,
			location: req.body.location,
			start: 
			{
				dateTime: req.body.from,
			},
			end: 
			{
				dateTime: req.body.until,
			},
		};
		calendar.events.insert(
		{
			auth: auth,
			calendarId: 'primary',
			resource: event,
		}, 
		function(err, event) 
		{
			if (err) 
			{
				console.log('There was an error contacting the Calendar service: ' + err);
				res.status(412).send(err);
			}
			else
			{
				res.setHeader('Content-Type', 'application/json');
				res.send(event);
			}
		});
	}

	app.post('/api/yourhome/nextEvents', function (req, res)
	{
		console.log("Next Events".green);
		
		/*fs.readFile('client_secret.json', function processClientSecrets(err, content) 
		{
			if (err) 
			{
				console.log('Error loading client secret file: ' + err);
			}*/
			authorize(req, res, listEvents);
		//});
	});

	app.post('/api/yourhome/saveEvent', function (req, res)
	{
		console.log("hit");
		
		/*fs.readFile('client_secret.json', function processClientSecrets(err, content) 
		{
			if (err) 
			{
				console.log('Error loading client secret file: ' + err);
			}*/
			authorize(req, res, saveEvent);
		//});
	});

};