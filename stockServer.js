"use strict";

var express = require('express');
var app = express();
//var util = require('util');
var bodyParser = require("body-parser");
app.set('views',__dirname);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('colors');

//var _ = require('lodash');
var yahooFinance = require('Yahoo-finance');


app.get('/', function (req,res)
{
	console.log("user connnected");
	res.sendfile("stock.html");
});

app.post('/getStock', function (req, res)
{
	updateFavStocks(req);
	getStocks(req.body.symbols, function(stocks)
    {
        res.setHeader('Content-Type', 'application/json');
		res.send(stocks);
    });
});

function getStocks(stockArray, callBackFn)
{
    var results = [];
    yahooFinance.snapshot(
    {
        symbols: stockArray
    }, function (err, result) 
    {
        if (err) 
        { 
            throw err; 
        }
        //console.dir(result);
        for (var i = 0; i < result.length; i++)
        {
            var tempObj = {};
            tempObj.name = result[i].name;
			tempObj.symbol = result[i].symbol;
			tempObj.lastTradePriceOnly = result[i].lastTradePriceOnly;
			tempObj.change = result[i].change;
            tempObj.percentChange = result[i].changeInPercent * 100;//*100 to get it in a percent
			results.push(tempObj);
        }
        callBackFn(results);
    });
}

function updateFavStocks(req)
{
    /*
    if requested stocks are the same as in the cookie
    {
        saveUsersNewFavStocks
    }*/
}

function areArraysEqual(ary1, ary2)
{
    if (!ary1 || !ary2)
        return false;

    if (ary1.length !== ary2.length)
        return false;

    for (var i = 0; i < ary1.length; i++) {
        if (ary1[i] !== ary2[i]) { 
            return false;   
        }           
    }       
    return true;
}
exports.getStocks = getStocks;
exports.areArraysEqual = areArraysEqual;

app.listen(8080);
console.log("server started");