var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'fzrbrgc2r5jrtn5c',
  publicKey: 'bsp5v93z43fyzqtp',
  privateKey: 'ef7be1beb162507e1bcca5f0e8323353'
});

module.exports = {
  gateway: gateway
}
