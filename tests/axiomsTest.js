var loc = "../packages/custom/test/server/routes/";

var assert = require('assert');
var stockJS = require(loc+ "stockServer.js");

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