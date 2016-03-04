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

function authorize(req, res, callBackFn) {

	//var clientSecret = "Check dropbox";
	//var clientId = "Check dropbox";
	  
	var redirectUrl = "http://localhost:8080";
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(EM_TOKEN_PATH, function(err, token) //MONGO read
	{
		if (err) 
		{
			console.log("getting new token ------------------------------------------");
			getNewToken(oauth2Client, callBackFn, req, res);
		} 
		else 
		{
			console.log("getting oldtoken ------------------------------------------");
			oauth2Client.credentials = JSON.parse(token);
			console.log(token +"--------------------------------------------------------");
			callBackFn(oauth2Client, req, res);
		}
	});
}


function getNewToken(oauth2Client, callBackFn, req, res) {
	var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
        "https://www.googleapis.com/auth/gmail.modify", 
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.send"];
	var authUrl = oauth2Client.generateAuthUrl(
	{
		access_type: 'offline',
		scope: SCOPES
	});
	if ((req.query.code === null) || (req.query.code === undefined) || (req.query.code === {}) )
	{
		var custEmails = [];
		var tempObj = {};
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
			callBackFn(oauth2Client, req, res);
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
		if (err.code !== 'EEXIST') 
		{
			throw err;
		}
	}
	fs.writeFile(EM_TOKEN_PATH, JSON.stringify(token));//MONGO write
	console.log('Token stored to ' + EM_TOKEN_PATH);
}


function listEmails(auth, req, res) 
{
   var custEmails = [];
   var gmail = google.gmail('v1');
   //console.log();
    gmail.users.messages.list({
        auth: auth,
        userId: 'me',
        labelIds: 'INBOX',
        maxResults: req.body.maxResults,
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
        if (messages.length === 0) 
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
				});
            }
        }
	});
}
  
  
function returnEmData(emailsAry, req, res)
{
	console.log(util.format(emailsAry).yellow);
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
			console.log('...The API returned an error: ' + err);
            res.setHeader('Content-Type', 'application/json');
	        res.send(err);
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
			console.log('...The API returned an error: ' + err);
            res.setHeader('Content-Type', 'application/json');
	        res.send(err);
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
            res.setHeader('Content-Type', 'application/json');
	        res.send(err);
			return;
        }
        res.setHeader('Content-Type', 'application/json');
	    res.send(response);
	});    
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
		authorize(req, res, listEmails);
	});
});

app.post('/sendEmail', function (req, res)
{
	console.log("hit");
	fs.readFile('client_secret.json', function processClientSecrets(err, content) 
	{
		if (err) 
		{
			console.log('Error loading client secret file: ' + err);
		}
		authorize(req, res, sendEmail);
	});
});

app.post('/modifyEmails', function (req, res)
{
	console.log("hit");
	fs.readFile('client_secret.json', function processClientSecrets(err, content) 
	{
		if (err) 
		{
			console.log('Error loading client secret file: ' + err);
		}
        else if(req.body.status === "UNREAD")
        {
            authorize(req, res, markAsRead);
        }
		else if(req.body.status === "STARRED")
        {
            authorize(req, res, emailStarred);
        }
	});
});

app.listen(8080);
console.log("server started");