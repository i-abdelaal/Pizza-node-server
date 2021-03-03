/*
 *
 * Hashing password helper function
 *
 */

// Factory function
const Crypt = function ({crypto, config}) {
  // Create a SHA256 hash
  this.hash = function (str) {
    if (typeof str == "string" && str.length > 0) {
      const hash = crypto
        .createHmac("sha256", config.hashSecret)
        .update(str)
        .digest("hex");
      return hash;
    } else {
      return false;
    }
  };
};

// Export the module
module.exports = Crypt;
