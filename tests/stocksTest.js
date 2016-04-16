var loc = "../packages/custom/yourhome/server/routes/";

var assert = require('assert');
var stockJS = require(loc+ "stocks.js");
var req = {};

describe('Stocks', function() {
	describe('#getStocks()', function () {
		it('should get 1 object from the API for one stock', function (done) {
			stockJS.getStocks(req,["GOOG"], function(stocks)
		    {
				assert.equal(stocks.length, 1);
			    done();
		    });
		});
		it('should get 2 objects from the API for an array of  2 stocks', function (done) {
			stockJS.getStocks(req,["GOOG","MSFT"], function(stocks)
		    {
				assert.equal(stocks.length, 2);
			    done();
		    });
		});
		it('should get real data for a stock array', function (done) {
			stockJS.getStocks(req,["GOOG","MSFT"], function(stocks)
		    {
				assert(!(isNaN(stocks[0].lastTradePriceOnly)));
			    done();
		    });
		});
    });
	describe('#areArraysEqual()', function() {
		it('should say an array is equal to itself', function () {
			var array = [1,2,3];
			assert.equal(stockJS.areArraysEqual(array, array), true);
		});
		it('should say 2 equal arrays are empty', function () {
			var array1 = [1,2,3];
			var array2 = [1,2,3];
			assert.equal(stockJS.areArraysEqual(array1, array2), true);
		});
		it('should say 2 empty arrays are empty', function () {
			var array1 = [];
			var array2 = [];
			assert.equal(stockJS.areArraysEqual(array1, array2), true);
		});
		it('should say 2 arrays with different lengths are unequal', function () {
			var array1 = [1,2];
			var array2 = [1,2,3];
			assert.equal(stockJS.areArraysEqual(array1, array2), false);
		});
		it('should say an empty array is not equal to a filled array', function () {
			var array1 = [1,2,3];
			var array2 = [];
			assert.equal(stockJS.areArraysEqual(array1, array2), false);
		});
		it('should say 2 unequal arrays of the same length are unequal', function () {
			var array1 = [5,6,7];
			var array2 = [1,2,3];
			assert.equal(stockJS.areArraysEqual(array1, array2), false);
		});
	});
});