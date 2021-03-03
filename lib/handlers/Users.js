/*
 * Users submethods
 *
 */

// Factory function
const Users = function ({ _data, _tokens, helpers }) {
  // Users - post
  // Required data: name, email, streetAddress, password
  // Optional data: none
  this.post = function (data, callback) {
    // Check that all required fields are filled out
    const name =
      typeof data.payload.name == "string" &&
      data.payload.name.trim().length > 0
        ? data.payload.name.trim()
        : false;

    const streetAddress =
      typeof data.payload.streetAddress == "string" &&
      data.payload.streetAddress.trim().length > 0
        ? data.payload.streetAddress.trim()
        : false;

    const email =
      typeof data.payload.email == "string" &&
      data.payload.email.trim().length > 0 &&
      data.payload.email.trim().indexOf("@") > -1
        ? data.payload.email.trim()
        : false;

    const password =
      typeof data.payload.password == "string" &&
      data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;

    if (name && streetAddress && email && password) {
      // Make sure that the user doesn't already exist
      _data.read("users", email, function (err, data) {
        if (err) {
          // Hash the password
          const hashedPassword = helpers.crypt.hash(password);

          if (hashedPassword) {
            // Create the user object
            const userObject = {
              name,
              streetAddress,
              email,
              hashedPassword,
            };

            // Store the user
            _data.create("users", email, userObject, function (err) {
              if (!err) {
                delete userObject.hashedPassword;
                callback(201, userObject);
              } else {
                console.log(err);
                callback(500, { Error: "Could not create the new user" });
              }
            });
          } else {
            callback(500, { Error: "Could not hash the password" });
          }
        } else {
          // User already exists
          callback(400, {
            Error: "A user with that email already exists",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing required field(s)" });
    }
  };

  // Users - get
  // Required data: email
  // Optional data: none
  this.get = function (data, callback) {
    // Check that the email is valid
    const email =
      typeof data.qureyStringObject.email == "string" &&
      data.qureyStringObject.email.length > 0 &&
      data.qureyStringObject.email.indexOf("@") > -1
        ? data.qureyStringObject.email
        : false;

    if (email) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      // Verify that the given token is valid for the email
      _tokens.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read("users", email, function (err, userData) {
            if (!err && userData) {
              // Remove the hashed password from the user object before returning
              delete userData.hashedPassword;
              callback(200, userData);
            } else {
              callback(404);
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in the header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing required field" });
    }
  };

  // Users - put
  // Required data: email
  // Optional data: name, streetaddress, password (at least one must be specified)
  this.put = function (data, callback) {
    // Check for the required field
    const email =
      typeof data.payload.email == "string" &&
      data.payload.email.trim().length > 0 &&
      data.payload.email.trim().indexOf("@") > -1
        ? data.payload.email
        : false;

    // Check for the optional fields
    const name =
      typeof data.payload.firstName == "string" &&
      data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    const streetAddress =
      typeof data.payload.streetAddress == "string" &&
      data.payload.streetAddress.trim().length > 0
        ? data.payload.streetAddress.trim()
        : false;
    const password =
      typeof data.payload.password == "string" &&
      data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;

    // Error if the email is invalid
    if (email) {
      // Error if nothing is sent to update
      if (name || streetAddress || password) {
        // Get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid for the email
        _tokens.verifyToken(token, email, function (tokenIsValid) {
          if (tokenIsValid) {
            // Lookup the user
            _data.read("users", email, function (err, userData) {
              if (!err && userData) {
                // Update the necessary fields
                if (name) {
                  userData.name = name;
                }
                if (streetAddress) {
                  userData.streetAddress = streetAddress;
                }
                if (password) {
                  userData.hashedPassword = helpers.crypt.hash(password);
                }

                // Store the updated fields
                _data.update("users", email, userData, function (err) {
                  if (!err) {
                    callback(200, userData);
                  } else {
                    console.log(err);
                    callback(500, { Error: "Could not update the user" });
                  }
                });
              } else {
                callback(400, { Error: "The specified user does not exist" });
              }
            });
          } else {
            callback(403, {
              Error:
                "Missing required token in the header, or token is invalid",
            });
          }
        });
      } else {
        callback(400, { Error: "Missing fields to update" });
      }
    } else {
      callback(400, { Error: "Missing requied field" });
    }
  };

  // Users - delete
  // Required field: email
  this.delete = function (data, callback) {
    // Check that the email is valid
    const email =
      typeof data.qureyStringObject.email == "string" &&
      data.qureyStringObject.email.length > 0;
    data.qureyStringObject.email.indexOf("@") > -1
      ? data.qureyStringObject.email
      : false;
    if (email) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      // Verify that the given token is valid for the email
      _tokens.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read("users", email, function (err, userData) {
            if (!err && userData) {
              _data.delete("users", email, function (err) {
                if (!err) {
                  // Delete each order associated with the user
                  const userOrders =
                    typeof userData.orders == "object" &&
                    userData.orders instanceof Array &&
                    userData.orders.length > 0
                      ? userData.orders
                      : [];
                  const ordersToDelete = userOrders.length;
                  if (ordersToDelete > 0) {
                    let ordersDeleted = 0;
                    let deletionErrors = false;
                    // Loop through the orders
                    userOrders.forEach(function (orderId) {
                      _data.delete("orders", orderId, function (err) {
                        if (err) deletionErrors = false;
                        ordersDeleted++;
                        if (ordersDeleted == ordersToDelete) {
                          if (!deletionErrors) {
                            callback(200, { Message: "User has been deleted" });
                          } else {
                            callback(500, {
                              Error:
                                "All orders may not have been deleted from the system successfully",
                            });
                          }
                        }
                      });
                    });
                  } else {
                    callback(200, { Message: "User has been deleted" });
                  }
                } else {
                  callback(500, {
                    Error: "Could not delete the specified user",
                  });
                }
              });
            } else {
              callback(400, { Error: "Could not find the specified user" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in the header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing reuired field" });
    }
  };
};

// Export the module
module.exports = Users;
