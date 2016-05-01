var should = require('should');
var chai = require('chai');
var db_config = require('../config/db');

var mongoose = require('mongoose');
var runTestSuite = module.exports.runTestSuite = function() {
  describe("DB connection", function() {
    it('connection with mongo db should be optionaly established', function (done) {
      mongoose.connect(db_config.db_host + "/" + db_config.db_name, function(err) {
        if (err) {
          throw err;
          chai.expect.fail();
        }
        done();
      });
    });
  });
};
