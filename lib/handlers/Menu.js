/*
 * Menu submethods
 *
 */

// Factory function
const Menu = function ({ _data }) {
  // Menu - get
  // Required data: token ID
  // Optional data: none
  this.get = function (data, callback) {
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // Verify that the given token is valid for the email
    if (token) {
      // Check if token is expired
      _data.read("tokens", token, function (err, tokenData) {
        if (!err && tokenData) {
          if (tokenData.expires > Date.now()) {
            _data.read("menu", "items", function (err, menuItems) {
              if (!err && menuItems) {
                callback(200, menuItems);
              } else {
                callback(500);
              }
            });
          } else {
            callback(403, {
              Error: "Token expired",
            });
          }
        } else {
          callback(403, {
            Error: "Invalid token",
          });
        }
      });
    } else {
      callback(400, { Error: "Token is missing" });
    }
  };
};

// Export the module
module.exports = Menu;
