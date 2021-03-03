/*
 *
 *   This helper function performs payments via Stripe API
 *
 */

// Factory function
const Stripe = function ({ https, querystring, config }) {
  // Send a payment via stripe
  this.sendStripePayment = function (amount, stripeToken, callback) {
    // Validate paramiters
    stripeToken =
      typeof stripeToken == "string" && stripeToken.trim().length > 0
        ? stripeToken.trim()
        : false;
    amount = typeof amount == "number" && amount > 0 ? amount : false;
    if (amount) {
      // Configure the request payload
      const payload = {
        amount,
        currency: "usd",
        source: stripeToken,
        description: "This is the payment integration with stripe API",
      };

      // Stringify the payload
      const stringPayload = querystring.stringify(payload);

      // Configure the request details
      const requestDetails = {
        protocol: "https:",
        hostname: "api.stripe.com",
        method: "POST",
        path: "/v1/charges",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringPayload),
          Authorization: "Bearer " + config.stripe.secretKey,
        },
      };

      // Instantiate the request object
      const req = https.request(requestDetails, function (res) {
        // Grab the status of the sent request
        const status = res.statusCode;

        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          callback(false);
        } else {
          callback("Status code returned was " + status);
        }
      });

      // Bind to the error event so it does not get through
      req.on("error", function (e) {
        callback(e);
      });

      // Add the payload
      req.write(stringPayload);

      // End the request
      req.end();
    } else {
      callback("Given paramiters were missing or invalid");
    }
  };
};

// Export the module
module.exports = Stripe;
