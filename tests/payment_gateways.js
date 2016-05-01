var app_config = require("../config/application");
var request = require("request");
var headers = {
  'Content-Type': 'application/json'
};

var baseUrl = app_config.protocol + "://" + app_config.host + ":" + app_config.port;

var runTestSuite = module.exports.runTestSuite = function() {
  describe("Payment Gateways", function() {

    it('paypal', function (done) {
      var send_data = {
        card_type: 'visa',
        cc_data: {
          'amount': '10',
          'curr': 'USD',
          'fullname': 'Ilya Shulgin',
          'holder_name': 'Ilya Shulgin',
          'number': '4860234270065416',
          'expire': '10/2018',
          'ccv': '123'
        }
      };
      this.timeout(10000); // ==== TODO: figure out how to avoid timeout usage
      request({
        url: baseUrl + "/payment_gateway_paypal",
        method: "POST",
        headers: headers,
        body: JSON.stringify(send_data)
      }, function(err, res, body) {
        res.statusCode.should.be.equal(201);
        var res_body = JSON.parse(body);
        res_body.status.should.be.equal(true);
        done();
      });
    });

    it('braintree', function (done) {
      var send_data = {
        amount: '10',
        nonce: '6bf8f5a7-5e85-45d1-804d-0cc9cc4d2f0d'
      };
      this.timeout(10000); // ==== TODO: figure out how to avoid timeout usage
      request({
        url: baseUrl + "/payment_gateway_braintree",
        method: "POST",
        headers: headers,
        body: JSON.stringify(send_data)
      }, function(err, res, body) {
        res.statusCode.should.be.equal(201);
        // ==== we can't test braintree, cause nonce MUST be generated and pasted from client side
        // ==== and nonce can be used only once, which also don't allow to use mock data
        done();
      });
    });

  });
};
