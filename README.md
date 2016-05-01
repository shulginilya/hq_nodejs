1. make sure that mongo db instance is up-and-running ( it is optional, in case of you want to save order data and response from payment gateway to mongo collection )
2. sudo npm install
3. run 'node server.js'
4. open http://localhost:3000/ link in your browser
5. test paypal credit card credentials:
4860234270065416
123
10/2018
6. test braintree credit card credetials:
4111111111111111
123
10/2018
7. in order to use tests, install mocha globally, "sudo npm install -g mocha"
8. from /tests folder run "mocha all" (make sure that server is running then you run the tests)
