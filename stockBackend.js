var express = require('express');
var app = express();
var util = require('util');
var bodyParser = require("body-parser");
app.set('views',__dirname);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
		var tempObj = {};
		tempObj.symbol = snapshot.symbol;
		tempObj.lastTradePriceOnly = snapshot.lastTradePriceOnly;
		tempObj.change = snapshot.change;
		
		res.setHeader('Content-Type', 'application/json');
		res.send(tempObj);

	});
});

app.post('/multStocks', function (req, res)
{
	console.log("hit");
	//console.log(req);
	var SYMBOLS = [
		'AAPL',
		'GOOG',
		'MSFT']
	var results = [];
	i=0;
	
	yahooFinance.snapshot({
	symbols: SYMBOLS
	}).then(function (result) 
	{
		_.each(result, function (snapshot, symbol)
		{
			console.log(util.format('=== %s ===', snapshot.name).cyan);
			console.log(JSON.stringify(snapshot, null, 2));
			
			//results[i] = JSON.stringify({snapshot});
			var tempObj = {};
			tempObj.symbol = snapshot.symbol;
			tempObj.lastTradePriceOnly = snapshot.lastTradePriceOnly;
			tempObj.change = snapshot.change;
			results[i] = tempObj;
			i++
		});
		//console.log(tempObj);
		res.setHeader('Content-Type', 'application/json');
		res.send(results);
	});
});

app.listen(8080);
console.log("server started");