var mongoose = require('mongoose');

var paymentsSchema = mongoose.Schema({
  source: {
    type: String,
    default: ""
  },
  payment_info: {
    type: {},
    default: {}
  },
  stamp: {
    type: Date,
    default: Date.now
  }
});

var payments_model = mongoose.model('Payments', paymentsSchema);
module.exports = payments_model;
