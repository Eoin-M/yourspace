
"use strict";
module.exports = function(Yourhome, app, auth, database) {  

	require('colors');

	var _ = require('lodash');
	var yahooFinance = require('yahoo-finance');


	app.post('/api/yourhome/getStock', function (req, res)
	{
		getStocks(req, req.body.symbols, function(stocks)
		{
			res.setHeader('Content-Type', 'application/json');
			res.send(stocks);
		});
	});

	function getStocks(req, stockArray, callBackFn)
	{
		if(req.session && req.session.user) {
			if(stockArray === null)	stockArray = req.session.user.stocks;
			else if(!areArraysEqual(stockArray, req.session.user.stocks)) {				
				req.session.user.stocks = stockArray;
				updateFavStocks(req, stockArray);
			}
		}
		else if(stockArray === null){
			stockArray = ['GOOG', 'AAPL'];
		}
		if(stockArray.length == 0) {
			console.log(stockArray.length);
			callBackFn(stockArray);
			return;
		}
		
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
				//console.dir(result);
				//console.dir(result);
				var tempObj = {};
				tempObj.name = result[i].name;
				tempObj.symbol = result[i].symbol;
				tempObj.lastTradePriceOnly = result[i].lastTradePriceOnly;
				tempObj.change = result[i].change;
				tempObj.percentChange = result[i].changeInPercent*100;
				if(tempObj.percentChange === null) tempObj.percentChange = 0; 
				results.push(tempObj);
			}
			//console.dir(results);
			callBackFn(results);
		});
	}

	function updateFavStocks(req, stocks)
	{
		var mongoose = require('mongoose'),
		User = mongoose.model('User');
	
		User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"stocks": stocks}}, {upsert:false}, function(err, user){
			if (err) console.log(err);
			return;
		});
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


};