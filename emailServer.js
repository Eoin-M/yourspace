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

var EM_TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var EM_TOKEN_PATH = EM_TOKEN_DIR + 'gmail-nodejs-quickstart.json';
/*NB: These are the paths to and names of the tokens google gives us to access the client's data
*They will eventually be gotten from MongoDB when that's working but for now they're stored locally
*
*/
var userCode = null;

function authorize(listEventsFn, req, res) {
  
	//var clientSecret = "Check dropbox";
	//var clientId = "Check dropbox";
	  
	var redirectUrl = "http://localhost:8080";
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(EM_TOKEN_PATH, function(err, token) 
	{
		if (err) 
		{
			console.log("getting new token ------------------------------------------");
			getNewToken(oauth2Client, listEventsFn, req, res);
		} 
		else 
		{
			console.log("getting oldtoken ------------------------------------------");
			oauth2Client.credentials = JSON.parse(token);
			console.log(token +"--------------------------------------------------------");
			listEventsFn(oauth2Client, req, res);
		}
	});
}


function getNewToken(oauth2Client, listEmailsFn, req, res) {
	var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
	var authUrl = oauth2Client.generateAuthUrl(
	{
		access_type: 'offline',
		scope: SCOPES
	});
   
	if (userCode == null)
	{
		var custEmails = [];
		var tempObj = {}
		tempObj.auth = false;
		tempObj.link = authUrl;
		custEmails[0] = tempObj;
		res.setHeader('Content-Type', 'application/json');
		res.send(custEmails);
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
			listEmailsFn(oauth2Client, req, res);
		});
	}
}


function storeToken(token) {
	try 
	{
		fs.mkdirSync(EM_TOKEN_DIR);
	} 
	catch (err) 
	{
		if (err.code != 'EEXIST') 
		{
			throw err;
		}
	}
	fs.writeFile(EM_TOKEN_PATH, JSON.stringify(token));
	console.log('Token stored to ' + EM_TOKEN_PATH);
}


function listEvents(auth, req, res) 
{
   var custEmails = [];
   var gmail = google.gmail('v1');
    gmail.users.messages.list({
        auth: auth,
        userId: 'me',
        labelIds: 'INBOX',
    }, function(err, response) {
        if (err) 
		{
			console.log('Email not found... The API returned an error: ' + err);
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
	console.log(util.format(emailsAry).yellow);
	res.setHeader('Content-Type', 'application/json');
	res.send(emailsAry);
} 
      


app.get('/', function (req,res)
{
    userCode = req.query.code;
	console.log("user connnected");
	res.sendfile("email.html");
});

app.post('/nextEmails', function (req, res)
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

app.listen(8080);
console.log("server started");