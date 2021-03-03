/*
 * Orders submethods
 *
 */

// Factory function
const Orders = function ({ _data, _tokens, helpers, config }) {
  // Orders - post (add to cart)
  // Required data: itmeId, itemCount
  // Optional data: none
  this.post = function (data, callback) {
    // Validate inputs

    const itemId =
      typeof data.payload.itemId == "number" && data.payload.itemId > 0
        ? data.payload.itemId
        : false;

    const itemCount =
      typeof data.payload.itemCount == "number" && data.payload.itemCount > 0
        ? data.payload.itemCount
        : false;

    if (itemId && itemCount) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      // Lookup the user from the token
      _data.read("tokens", token, function (err, tokenData) {
        if (!err && tokenData.expires > Date.now()) {
          const userEmail = tokenData.userEmail;

          // Lookup the item price
          _data.read("menu", "items", function (err, data) {
            if (!err && data) {
              data.menuItems.forEach(function (item) {
                if (item.id == itemId) {
                  const totalItemPrice = item.price * itemCount;
                  // Lookup the user data
                  _data.read("users", userEmail, function (err, userData) {
                    if (!err && userData) {
                      if (!userData.orderId) {
                        // Create a random ID for the order
                        const orderId = helpers.utilities.createRandomString(
                          config.checkRandomNumber
                        );

                        // Add the order ID to user information
                        userData.orderId = orderId;

                        // Create the order object and include the user email
                        const orderObject = {};
                        orderObject["id"] = orderId;
                        orderObject["userEmail"] = userData.email;
                        orderObject[itemId] = itemCount;
                        orderObject["total"] = totalItemPrice;

                        // Store the order object
                        _data.create(
                          "orders",
                          orderId,
                          orderObject,
                          function (err) {
                            if (!err) {
                              // Save the new user data
                              _data.update(
                                "users",
                                userEmail,
                                userData,
                                function (err) {
                                  if (!err) {
                                    // Return the order object
                                    callback(201, orderObject);
                                  } else {
                                    callback(500, {
                                      Error:
                                        "Could not update the user with the new order",
                                    });
                                  }
                                }
                              );
                            } else {
                              callback(500, {
                                Error: "Could not create the new order",
                              });
                            }
                          }
                        );
                      } else {
                        // Lookup the order
                        _data.read(
                          "orders",
                          userData.orderId,
                          function (err, orderData) {
                            if (!err && orderData) {
                              // Check if the item ID exist on this order to add up it's count, otherwise add it
                              if (!orderData[itemId]) {
                                orderData[itemId] = itemCount;
                                orderData["total"] += totalItemPrice;
                              } else {
                                orderData[itemId] += itemCount;
                                orderData["total"] += totalItemPrice;
                              }

                              // Save the updated order
                              _data.update(
                                "orders",
                                userData.orderId,
                                orderData,
                                function (err) {
                                  if (!err) {
                                    callback(201, orderData);
                                  } else {
                                    callback(500, {
                                      Error: "Could not update the order",
                                    });
                                  }
                                }
                              );
                            } else {
                              callback(400, { Error: "Wrong order ID" });
                            }
                          }
                        );
                      }
                    } else {
                      callback(403);
                    }
                  });
                }
              });
            } else {
              callback(500);
            }
          });
        } else {
          callback(403);
        }
      });
    } else {
      callback(400, {
        Error: "Missing required inputs, or inputs are invalid",
      });
    }
  };

  // Orders - get
  // Required data: orderId
  // Optional data: none
  this.get = function (data, callback) {
    // Check that the orderId is valid
    const orderId =
      typeof data.qureyStringObject.orderId == "string" &&
      data.qureyStringObject.orderId.length == config.checkRandomNumber
        ? data.qureyStringObject.orderId
        : false;

    if (orderId) {
      // Lookup the order
      _data.read("orders", orderId, function (err, orderData) {
        if (!err && orderData) {
          // Get the token from the headers
          const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

          if (token) {
            // Verify the token is valid and belong to the user who created the order
            _tokens.verifyToken(
              token,
              orderData.userEmail,
              function (tokenIsValid) {
                if (tokenIsValid) {
                  // Return the order data
                  callback(200, orderData);
                } else {
                  callback(403, { Error: "Invalid token" });
                }
              }
            );
          } else {
            callback(403, { Error: "Token is missing from the headers" });
          }
        } else {
          callback(404);
        }
      });
    } else {
      callback(400, { Error: "Missing required filed" });
    }
  };

  // Orders - delete
  // Required data: order ID, token ID
  // Optional data: none
  this.delete = function (data, callback) {
    // Check that the order Id is valid
    const orderId =
      typeof data.qureyStringObject.orderId == "string" &&
      data.qureyStringObject.orderId.length == config.checkRandomNumber
        ? data.qureyStringObject.orderId
        : false;
    if (orderId) {
      // Lookup the order
      _data.read("orders", orderId, function (err, orderData) {
        if (!err && orderData) {
          // Get the token from the headers
          const token =
            typeof data.headers.token == "string" ? data.headers.token : false;
          if (token) {
            // Verify that the given token is valid for the user
            _tokens.verifyToken(
              token,
              orderData.userEmail,
              function (tokenIsValid) {
                if (tokenIsValid) {
                  // Delete the order data
                  _data.delete("orders", orderId, function (err) {
                    if (!err) {
                      // Lookup the user
                      _data.read(
                        "users",
                        orderData.userEmail,
                        function (err, userData) {
                          if (!err && userData) {
                            // Remove the deleted order
                            userData.orderId = false;

                            // Resave the user data
                            _data.update(
                              "users",
                              orderData.userEmail,
                              userData,
                              function (err) {
                                if (!err) {
                                  callback(200, {
                                    Message: `Order ID ${orderId} has been deleted`,
                                  });
                                } else {
                                  callback(500, {
                                    Error:
                                      "Could not remove the order ID from the user cart",
                                  });
                                }
                              }
                            );
                          } else {
                            callback(500, {
                              Error:
                                "Could not find the user who created the order to remove the order ID from their cart",
                            });
                          }
                        }
                      );
                    } else {
                      callback(500, {
                        Error: "Could not delete the specified order",
                      });
                    }
                  });
                } else {
                  callback(403, { Error: "Invalid token" });
                }
              }
            );
          } else {
            callback(403, { Error: "Missing token in the headers" });
          }
        } else {
          callback(400, { Error: "The specified order does not exist" });
        }
      });
    } else {
      callback(400, { Error: "Missing required field" });
    }
  };
};

// Export the module
module.exports = Orders;
