var mongoose = require('mongoose');

var db_models = {
  is_connect: true
};

mongoose.connect('mongodb://localhost/ishulgin_hotelquickly');
mongoose.connection.on('error', function (error) {
  console.log('Mongoose default connection error: ' + error);
  db_models.is_connect = false;
});
mongoose.connection.on('connected', function () {
  db_models.payments_model = require("./payments_model");
});

module.exports.db_models = db_models;
