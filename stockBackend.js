var express = require('express');
var app = express();
var util = require('util');
var bodyParser = require("body-parser");
app.set('views',__dirname);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.set('view engine', 'jade');

require('colors');

var _ = require('lodash');
var yahooFinance = require('Yahoo-finance');


var SYMBOL = 'AAPL';
app.get('/', function (req,res)
{
	console.log("user connnected");
	res.sendfile("index.html");
});

app.post('/stocks', function (req, res)
{
	console.log("hit");
	console.log(req);
	SYMBOL = req.body.target;
	
	yahooFinance.snapshot({
	symbol: SYMBOL
	}).then(function (snapshot) 
	{
		console.log(util.format('=== %s ===', SYMBOL).cyan);
		//console.log(JSON.stringify(snapshot, null, 2));
	  
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({stock:snapshot}));

	});
});

app.listen(8080);
console.log("server started");