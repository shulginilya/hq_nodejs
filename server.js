var app_config = require("./config/application");

// ==== libs injection
var payment_gateways = require("./payment_gateways");

// ==== server initialization
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(app_config.port, function () {
  console.log('app is listening on port ' + app_config.port);
});

// ==== landing page
app.get('/', function(req, res) {
  res.render('index', { title: 'Payments'});
});

// ==== requests handler
app.post('/payment_gateway_paypal', function(req, res) {
  var send_data = {
    card_type: req.body.card_type,
    credit_card_data: req.body.cc_data
  };
  payment_gateways.paypalGate(send_data, function paymentCallback(error, payment_log_data) {
    res.contentType = 'json';
    res.status(201).send(payment_log_data);
  });
});

app.get("/braintree_client_token", function (req, res) {
  payment_gateways.braintreeToken(function tokenCallback(error, client_token) {
    res.contentType = 'json';
    res.status(201).send(client_token);
  });
});

app.post('/payment_gateway_braintree', function(req, res) {
  var send_data = {
    amount: req.body.amount,
    nonce: req.body.nonce
  };
  payment_gateways.braintreeGate(send_data, function paymentCallback(error, payment_log_data) {
    res.contentType = 'json';
    res.status(201).send(payment_log_data);
  });
});
