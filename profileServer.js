"use strict";

var express = require('express');
var app = express();


//var _ = require('lodash');


app.get('/', function (req,res)
{
	console.log("user connnected");
	res.sendfile("profile.html");
});

app.post('/getUserDetails', function (req, res)
{
	//read in details from cookie/database
    getUserDetails(req, function(profile)
    {
        res.setHeader('Content-Type', 'application/json');
		res.send(profile);
    })
    
});

function getUserDetails(req, callback)
{
    var profile = {};
    profile.name = "Joe Bloggs";
    profile.email = "joe@bloggs.eg";
    profile.imageURL = "http://thumbs.dreamstime.com/t/pineapple-single-white-background-vector-graphics-55526274.jpg";
    profile.hasGoogle = false;
    profile.hasTwitter = false;
    profile.hasFacebook = false;
    profile.hasInstagram = false;
    profile.hasGithub = false;
    profile.hasReddit = false;
    callback(profile);
}


app.listen(8080);
console.log("server started");