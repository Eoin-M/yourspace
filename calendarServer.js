//Reference: https://developers.google.com/google-apps/calendar/quickstart/nodejs
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events for events (colourID...)
//Check: https://developers.google.com/google-apps/calendar/v3/reference/events/list for choosing what day etc.

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

var CAL_REQ;//calendar request global variable
var CAL_RES;//calendar response global variable
var usersCode = null;


function authorize(callback) {
  
	//var clientSecret = "Check dropbox";
	//var clientId = "check dropbox";
	  
	var redirectUrl = "http://localhost:8080";
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	//console.log(CAL_TOKEN_PATH +"=============================================");
	fs.readFile(CAL_TOKEN_PATH, function(err, token) 
	{
		if (err) 
		{
			console.log("getting new token ------------------------------------------");
			getNewToken(oauth2Client, callback);
		} 
		else 
		{
			console.log("getting oldtoken ------------------------------------------");
			oauth2Client.credentials = JSON.parse(token);
			console.log(token +"--------------------------------------------------------");
			callback(oauth2Client);
		}
	});
}


function getNewToken(oauth2Client, callback) {
	var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
	var authUrl = oauth2Client.generateAuthUrl(
	{
		access_type: 'offline',
		scope: SCOPES
	});
	if (usersCode == null)
	{
		var custEvents = [];
		var tempObj = {}
		tempObj.auth = false;
		tempObj.link = authUrl;
		custEvents[0] = tempObj;
		CAL_RES.setHeader('Content-Type', 'application/json');
		CAL_RES.send(custEvents);
	}
	else
	{
		oauth2Client.getToken(usersCode, function(err, token) 
		{
			if (err) 
			{
				console.log("code" +usersCode);
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
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


function listEvents(auth) 
{
   
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
			//console.log(calendars);
			var i = 0;
			for (i = 0; i < calendars.length; i++)
			{
				//console.log(calendars[i].id);
				calendar.events.list(
				{
				  auth: auth,
				  calendarId: calendars[i].id,
				  timeMin: (new Date()).toISOString(),//today is the min date
				  //TODO add in min and max dates so we get one day's events
				  maxResults: 5,//number of events returned
				  singleEvents: true,
				  orderBy: 'startTime'
				}, 
				function(err, response) 
				{
					if (err) 
					{
						console.log('ln:159 The API returned an error: ' + err);
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
					}
				}
            )}
        }
		setTimeout(returnCalData, 500, custEvents);//Temp solution until a way is found to know when all events are returned TODO
	});
}
  
  
function returnCalData(eventsAry)
{
	//console.log(util.format("CUSTEVENTS ===="+eventsAry).cyan);
	CAL_RES.setHeader('Content-Type', 'application/json');
	CAL_RES.send(eventsAry);
} 
      


app.get('/', function (req,res)
{
	usersCode = req.query.code;//reference: http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/
	console.log("user connnected");
	res.sendfile("calendar.html");
});

app.post('/nextEvents', function (req, res)
{
	console.log("hit");
	CAL_REQ = req;
	CAL_RES = res;
	
	fs.readFile('client_secret.json', function processClientSecrets(err, content) 
	{
		if (err) 
		{
			console.log('Error loading client secret file: ' + err);
		}
		authorize(listEvents);
	});
});

app.listen(8080);
console.log("server started");