//Reference: https://developers.google.com/google-apps/calendar/quickstart/nodejs
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events for events (colourID...)
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events/list for choosing what day etc.

"use strict";

var express = require('express');
var app = express();
var util = require('util');
var bodyParser = require("body-parser");
app.set('views',__dirname);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
require('colors');

var CAL_TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var CAL_TOKEN_PATH = CAL_TOKEN_DIR + 'calendar-nodejs-quickstart.json';
/*NB: These are the paths to and names of the tokens google gives us to access the client's data
*They will eventually be gotten from MongoDB when that's working but for now they're stored locally
*
*/
var userCode = null;

function authorize(callbackFn, req, res) {

	//var clientSecret = "Check dropbox";
	//var clientId = "Check dropbox";
	  
	var redirectUrl = "http://localhost:8080";
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(CAL_TOKEN_PATH, function(err, token) 
	{
		if (err) 
		{
			console.log("getting new token ------------------------------------------");
			getNewToken(oauth2Client, callbackFn, req, res);
		} 
		else 
		{
			console.log("getting oldtoken ------------------------------------------");
			oauth2Client.credentials = JSON.parse(token);
			console.log(token +"--------------------------------------------------------");
			callbackFn(oauth2Client, req, res);
		}
	});
}


function getNewToken(oauth2Client, callbackFn, req, res) {
	var SCOPES = ['https://www.googleapis.com/auth/calendar'];
	var authUrl = oauth2Client.generateAuthUrl(
	{
		access_type: 'offline',
		scope: SCOPES
	});
   
	if (userCode == null)
	{
		var custEvents = [];
		var tempObj = {}
		tempObj.auth = false;
		tempObj.link = authUrl;
		custEvents[0] = tempObj;
		res.setHeader('Content-Type', 'application/json');
		res.send(custEvents);
	}
	else
	{
		oauth2Client.getToken(userCode, function(err, token) 
		{
			if (err) 
			{
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callbackFn(oauth2Client, req, res);
		});
	}
}


function storeToken(token) {
	try 
	{
		fs.mkdirSync(CAL_TOKEN_DIR);
	} 
	catch (err) 
	{
		if (err.code != 'EEXIST') 
		{
			throw err;
		}
	}
	fs.writeFile(CAL_TOKEN_PATH, JSON.stringify(token));
	console.log('Token stored to ' + CAL_TOKEN_PATH);
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
			console.log('126: Calendar not found... The API returned an error: ' + err);
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

app.get('/', function (req,res)
{
    userCode = req.query.code;
	console.log("user connnected");
	res.sendfile("calendar.html");
});

app.post('/nextEvents', function (req, res)
{
	console.log("hit");
    
	fs.readFile('client_secret.json', function processClientSecrets(err, content) 
	{
		if (err) 
		{
			console.log('Error loading client secret file: ' + err);
		}
		authorize(listEvents, req, res);
	});
});

app.post('/saveEvent', function (req, res)
{
	console.log("hit");
    
	fs.readFile('client_secret.json', function processClientSecrets(err, content) 
	{
		if (err) 
		{
			console.log('Error loading client secret file: ' + err);
		}
		authorize(saveEvent, req, res);
	});
});

app.listen(8080);
console.log("server started");