var db_config = require('../config/db');
var mongoose = require('mongoose');

var db_models = {
  is_connect: true
};

mongoose.connect(db_config.db_host + "/" + db_config.db_name);
mongoose.connection.on('error', function (error) {
  console.log('Mongoose default connection error: ' + error);
  db_models.is_connect = false;
});
mongoose.connection.on('connected', function () {
  db_models.payments_model = require("./payments_model");
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports.db_models = db_models;
