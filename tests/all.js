describe("Perform all test cases", function() {
  require("./db").runTestSuite();
  require("./payment_gateways").runTestSuite();
});
