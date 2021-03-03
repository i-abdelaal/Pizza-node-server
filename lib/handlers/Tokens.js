/*
 * Tokens submethods
 *
 */

// Factory function
const Tokens = function ({ _data, helpers, config }) {
  // Tokens - post
  // Required data: email, password
  // Optional data: none
  this.post = function (data, callback) {
    const userEmail =
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

    if (userEmail && password) {
      // Lookup the user who maches that email
      _data.read("users", userEmail, function (err, userData) {
        if (!err && userData) {
          // Hash the sent password and compare it to the stored password
          const hashedPassword = helpers.crypt.hash(password);
          if (hashedPassword == userData.hashedPassword) {
            // If valid, create a new token with a random name and set the expiration date for 1 hour in the future
            const tokenId = helpers.utilities.createRandomString(
              config.tokenRandomNumberGenerator
            );
            const expires = Date.now() + 1000 * 60 * 60;
            const tokenObject = {
              userEmail,
              tokenId,
              expires,
            };

            // Store the token
            _data.create("tokens", tokenId, tokenObject, function (err) {
              if (!err) {
                callback(201, tokenObject);
              } else {
                callback(500, { Error: "Could not create the new token" });
              }
            });
          } else {
            callback(400, { Error: "Invalid password" });
          }
        } else {
          callback(400, { Error: "Could not find the specified user" });
        }
      });
    } else {
      callback(400, { Error: "Missing required field(s)" });
    }
  };

  // Tokens - get
  // Required data: tokenId
  // Optional data: none
  this.get = function (data, callback) {
    // Check that the sent tokenId is valid
    const tokenId =
      typeof data.qureyStringObject.tokenId == "string" &&
      data.qureyStringObject.tokenId.length == config.tokenRandomNumberGenerator
        ? data.qureyStringObject.tokenId
        : false;

    if (tokenId) {
      // Lookup the tokenId
      _data.read("tokens", tokenId, function (err, tokenData) {
        if (!err && tokenData) {
          callback(200, tokenData);
        } else {
          callback(404);
        }
      });
    } else {
      callback(400, { Error: "Missing required field" });
    }
  };

  // Tokens - put
  // Required data: tokenId, extend
  // Optional data: none
  this.put = function (data, callback) {
    const tokenId =
      typeof data.payload.tokenId == "string" &&
      data.payload.tokenId.length == config.tokenRandomNumberGenerator
        ? data.payload.tokenId
        : false;
    const extend =
      typeof data.payload.extend == "boolean" && data.payload.extend == true
        ? true
        : false;
    if (tokenId && extend) {
      // Lookup the token
      _data.read("tokens", tokenId, function (err, tokenData) {
        if (!err && tokenData) {
          // Check to make sure that the token isn't already expired
          if (tokenData.expires > Date.now()) {
            // Set the expiration an ahour from now
            tokenData.expires = Date.now() + 1000 * 60 * 60;

            // Store the new updates
            _data.update("tokens", tokenId, tokenData, function (err) {
              if (!err) {
                callback(200, tokenData);
              } else {
                callback(500, {
                  Error: "Could not update the specified token",
                });
              }
            });
          } else {
            callback(400, {
              Error: "The token has already expired and cannot be extended",
            });
          }
        } else {
          callback(400, { Error: "Specified token does not exist" });
        }
      });
    } else {
      callback(400, {
        Error: "Missing required field(s) or field(s) are invalid",
      });
    }
  };

  // Tokens - delete
  // Required data: tokenId
  // Optional data: none
  this.delete = function (data, callback) {
    // Check that the tokenId is valid
    const tokenId =
      typeof data.qureyStringObject.tokenId == "string" &&
      data.qureyStringObject.tokenId.length == config.tokenRandomNumberGenerator
        ? data.qureyStringObject.tokenId
        : false;
    if (tokenId) {
      // Lookup the token
      _data.read("tokens", tokenId, function (err, tokenData) {
        if (!err && tokenData) {
          _data.delete("tokens", tokenId, function (err) {
            if (!err) {
              callback(200, { Message: "Token deleted" });
            } else {
              callback(500, { Error: "Could not delete the specified token" });
            }
          });
        } else {
          callback(400, { Error: "Could not find the specified token" });
        }
      });
    } else {
      callback(400, { Error: "Missing required field" });
    }
  };

  // Verify if a given tokenId is currently valid for a given user
  this.verifyToken = function (tokenId, email, callback) {
    // Lookup the token
    _data.read("tokens", tokenId, function (err, tokenData) {
      if (!err && tokenData) {
        // Check if the token is for the given user and has not expired
        if (tokenData.userEmail == email && tokenData.expires > Date.now()) {
          callback(true);
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    });
  };
};

// Export the module
module.exports = Tokens;
