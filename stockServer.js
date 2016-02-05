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


app.get('/', function (req,res)
{
	console.log("user connnected");
	res.sendfile("stock.html");
});

app.post('/getStock', function (req, res)
{
	console.dir(req.body.symbols);
	var SYMBOLS = req.body.symbols;
	var results = [];
	
	yahooFinance.snapshot({
	symbols: SYMBOLS
	}).then(function (result)
	{
		_.each(result, function (snapshot, symbol)
		{
			console.log(util.format('=== %s ===', snapshot.name).cyan);
			console.dir(snapshot);
			var tempObj = {};
            tempObj.name = snapshot.name;
			tempObj.symbol = snapshot.symbol;
			tempObj.lastTradePriceOnly = snapshot.lastTradePriceOnly;
			tempObj.change = snapshot.change;
            tempObj.percentChange = snapshot.changeInPercent;
			results.push(tempObj);
			
		});
		//console.log(tempObj);
		res.setHeader('Content-Type', 'application/json');
		res.send(results);
	});
});

app.listen(8080);
console.log("server started");