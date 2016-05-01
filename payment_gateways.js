// ==== libs injection
var async_module = require('async');
var paypal_rest_sdk = require('paypal-rest-sdk');

// ==== DB models initialization
var db_models = require("./db_models/bootstrap").db_models;

// ===- get configs
var paypal_config = require('./config/paypal');
var braintree = require('./config/braintree');

module.exports = {
  paypalGate: function(data, cb) {
    var credit_card_data = data.credit_card_data;
    var card_type = data.card_type;
    var payment_log_data = {
      status: false,
      mongo_status: false
    };
    async_module.waterfall([
      payRequest = function(cbAsync) {
        paypal_rest_sdk.configure(paypal_config);
        var expire_arr = credit_card_data.expire.split("/");
        var fname = "";
        var lname = "";
        if(credit_card_data.holder_name !== "") {
          var holder_arr = credit_card_data.holder_name.split(" ");
          fname = holder_arr[0];
          if(typeof(holder_arr[1]) !== 'undefined') {
            lname = holder_arr[1];
          }
        }
        var payment_details = {
          'intent': 'sale',
          'payer': {
            'payment_method': 'credit_card',
            'funding_instruments': [
              {
                'credit_card': {
                  'type': card_type,
                  'number': credit_card_data.number,
                  'expire_month': expire_arr[0].trim(),
                  'expire_year': expire_arr[1].trim(),
                  'cvv2': credit_card_data.ccv
                }
              }
            ]
          },
          'transactions': [
            {
              'amount': {
                'total': credit_card_data.amount,
                'currency': credit_card_data.curr
              },
              'description': 'Credit card payment'
            }
          ]
        };
        if(fname !== "") {
          payment_details.payer.funding_instruments[0].credit_card.first_name = fname;
        }
        if(lname !== "") {
          payment_details.payer.funding_instruments[0].credit_card.last_name = lname;
        }
        paypal_rest_sdk.payment.create(payment_details, function(error, payment) {
          var i, len, paypal_error_msg, pe_msg, ref;
          if (error) {
            if(error.response.httpStatusCode == 503) {
              // payment_log_data.msg = error.response.name;
              payment_log_data.msg = "Paypal: Invalid credit card credentials";
            } else {
              paypal_error_msg = "";
              ref = error.response.details;
              for (i = 0, len = ref.length; i < len; i++) {
                pe_msg = ref[i];
                paypal_error_msg += pe_msg.issue + ".";
              }
              payment_log_data.msg = "Paypal: " + paypal_error_msg;
            }
          } else {
            payment_log_data.status = true;
            payment_log_data.msg = 'Paypal: Success transaction!';
            payment_log_data.payment_response = payment;
          }
          cbAsync(null, payment_log_data);
        });
      }, databaseSave = function(res, cbAsync) {
        // === optional mongo saver
        if(db_models.is_connect) {
          if(payment_log_data.status) {
            var payments_inject = new db_models.payments_model();
            payments_inject.source = 'paypal';
            payments_inject.payment_info = payment_log_data.payment_response;
            payments_inject.save(function(error, save_obj) {
              if (!error) {
                payment_log_data.mongo_status = true;
                payment_log_data.mongo_msg = "Payment log created successfully!";
              } else {
                payment_log_data.mongo_msg = error;
              }
              cbAsync(payment_log_data);
            });
          } else {
            cbAsync(payment_log_data);
          }
        } else {
          payment_log_data.mongo_msg = 'Connection to mongo is not established';
          cbAsync(payment_log_data);
        }
      }
    ], asyncComplete = function(payment_log_data) {
      cb(null, payment_log_data);
    });
  },
  braintreeToken: function(cb) {
    braintree.gateway.clientToken.generate({}, function (err, response) {
      cb(null, response.clientToken)
    });
  },
  braintreeGate: function(data, cb) {
    var payment_log_data = {
      status: false
    };
    async_module.waterfall([
      payRequest = function(cbAsync) {
        braintree.gateway.transaction.sale({
          amount: data.amount,
          paymentMethodNonce: data.nonce,
          options: {
            submitForSettlement: true
          }
        }, function (error, payment) {
          if(payment.success) {
            payment_log_data.status = true;
            payment_log_data.msg = 'Braintree: Success transaction!';
            payment_log_data.payment_order_info = "";
            payment_log_data.payment_response = payment;
          } else {
            payment_log_data.msg = "Braintree: " + payment.message;
          }
          cbAsync(null, payment_log_data);
        });
      }, databaseSave = function(res, cbAsync) {
        // === optional mongo saver
        if(db_models.is_connect) {
          if(payment_log_data.status) {
            var payments_inject = new db_models.payments_model();
            payments_inject.source = 'braintree';
            payments_inject.payment_info = payment_log_data.payment_response;
            payments_inject.save(function(error, save_obj) {
              if (!error) {
                payment_log_data.mongo_status = true;
                payment_log_data.mongo_msg = "Payment log created successfully!";
              } else {
                payment_log_data.mongo_msg = 'Server error during payment log creation';
              }
              cbAsync(payment_log_data);
            });
          } else {
            cbAsync(payment_log_data);
          }
        } else {
          payment_log_data.mongo_msg = 'Connection to mongo is not established';
          cbAsync(payment_log_data);
        }
      }
    ], asyncComplete = function(payment_log_data) {
      cb(null, payment_log_data);
    });
  }
};
