var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = 8638;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var nodemailer = require('nodemailer');
var request = require('request');

// create reusable transporter object using SMTP transport
var smtpConfig = {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: "yourspaceweb@outlook.com",
        pass: "pineapple?"
    },
    tls: {
        ciphers:'SSLv3'
    }
};

var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'yourspaceweb@outlook.com',
        pass: 'pineapple?'
    }
});

app.get('/', function(req, res){
	var key = 'api:key-cc78ec5f7daafb37354e0912bd177b01';
	var authR = 'Basic ' + new Buffer(key).toString('base64');
	
	request({
		url: 'https://' + key + '@api.mailgun.net/v3/eoinmaguire.com/messages',
		method: 'POST',
		headers: {
			'Authorization': authR
		},
		qs: {
			'from'		: 'YourSpace <yourspaceweb@gmail.com>',
			'to'		: 'eoin.mgr@gmail.com',
			'subject'	: 'Account Verification',
			'text'		: 'Please click below to verify your account'
		}
	}, function(error, response, body){
		console.log(body);
	});
	res.json('mail');
});

app.listen(PORT);
console.log('Server running at 127.0.0.1:' + PORT);