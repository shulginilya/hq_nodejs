var should = require('should');
var chai = require('chai');

var mongoose = require('mongoose');
var runTestSuite = module.exports.runTestSuite = function() {
  describe("DB connection", function() {
    it('connection with mongo db should be optionaly established', function (done) {
      mongoose.connect('mongodb://localhost/ishulgin_hotelquickly', function(err) {
        if (err) {
          throw err;
          chai.expect.fail();
        }
        done();
      });
    });
  });
};
