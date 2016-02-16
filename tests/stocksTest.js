var loc = "../packages/custom/test/server/routes/";

var assert = require('assert');
var stockJS = require(loc+ "stockServer.js");

describe('Stocks', function() {
	describe('#getStocks()', function (done) {
		it('should get 1 object from the API for one stock', function (done) {
			stockJS.getStocks(["GOOG"], function(stocks)
		    {
				assert.equal(stocks.length, 1);
			    done();
		    });
		});
		it('should get 2 objects from the API for an array of  2 stocks', function (done) {
			stockJS.getStocks(["GOOG","MSFT"], function(stocks)
		    {
				assert.equal(stocks.length, 2);
			    done();
		    });
		});
		it('should get real data for a stock array', function (done) {
			stockJS.getStocks(["GOOG","MSFT"], function(stocks)
		    {
				assert(!(isNaN(stocks[0].lastTradePriceOnly)));
			    done();
		    });
		});
    });
});