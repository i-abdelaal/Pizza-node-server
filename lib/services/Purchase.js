/*
 * Purchase service
 *
 */

// Factory function
const Purchase = function ({ _data, helpers }) {
  // Purchase - get
  // Required data: token ID
  // Optional data: none
  this.get = async function (data, callback) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    if (token) {
      // lookup the token data
      _data.read("tokens", token, function (err, tokenData) {
        if (!err && tokenData) {
          // Verify the token is not expired
          if (tokenData.expires > Date.now()) {
            // Lookup user
            _data.read("users", tokenData.userEmail, function (err, userData) {
              if (!err && userData) {
                const orderId = userData.orderId;
                if (orderId) {
                  // Lookup the order
                  _data.read("orders", orderId, function (err, orderData) {
                    if (!err && orderData) {
                      // Get the total cost of the order in cents
                      const totalInCents = Math.floor(orderData.total * 100);

                      // pay via stripe
                      helpers.stripe.sendStripePayment(
                        totalInCents,
                        "tok_visa",
                        function (err) {
                          if (!err) {
                            // Send email to the customer with their receipt
                            helpers.mailgun.sendEmail(
                              orderData.userEmail,
                              `Pizza Receipt ${Date.now()}`,
                              `Dear customer,\nThanks for ordering pizza with us.\nYour toal cost is ${orderData.total} $`,
                              function (err) {
                                if (!err) {
                                  // Delete the order
                                  _data.delete(
                                    "orders",
                                    orderId,
                                    function (err) {
                                      if (!err) {
                                        userData.orderId = false;
                                        // Clear up order ID value in user data
                                        _data.update(
                                          "users",
                                          tokenData.userEmail,
                                          userData,
                                          function (err) {
                                            if (!err) {
                                              callback(200, {
                                                Message: "Successfully ordered",
                                              });
                                            } else {
                                              callback(500, {
                                                Error:
                                                  "Failed to clear up order value in user Data",
                                              });
                                            }
                                          }
                                        );
                                      } else {
                                        callback(500, {
                                          Error: "Failed to clean up the order",
                                        });
                                      }
                                    }
                                  );
                                } else {
                                  console.log("mailgun", err);
                                  callback(500);
                                }
                              }
                            );
                          } else {
                            console.log("stripe", err);
                            callback(500);
                          }
                        }
                      );
                    } else {
                      console.log("order read", err);
                      callback(500);
                    }
                  });
                } else {
                  callback(400);
                }
              } else {
                callback(400);
              }
            });
          } else {
            callback(403, { Error: "Token expired" });
          }
        } else {
          callback(403, { Error: "Invalid token" });
        }
      });
    } else {
      callback(403, { Error: "Tokne is missing" });
    }
  };
};

// Export the module
module.exports = Purchase;
