/*var assert = require('assert');
var stockJS = require('./packages/custom/yourhome/server/routes/stockServer.js');
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
	  //console.log("Hi Eoin");
    });
  });
});

describe('Stocks', function() {
  describe('#getStocks()', function () {
    it('should get data back from the API', function () {
	  assert.equal(-1, [1,2,3].indexOf(5));
	  assert.equal(-1, [1,2,3].indexOf(0));
	  //console.log("Hi Eoin");
	  stockJS.getStocks(["GOOG","MSFT"], function(stocks)
	  {
		  console.dir(stocks);
	  });
    });
  });
});*/


var assert = require('assert');

describe('Axioms', function() {
	it('should say true is true', function () {
		assert(true);
    });
	it('should say pineapple is not a number', function () {
		assert(isNaN("pineapple"));
    });
	it('should prove basic addition', function () {
		assert.equal(1+1, 2);
    });
});