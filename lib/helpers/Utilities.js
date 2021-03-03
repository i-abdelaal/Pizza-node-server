/*
 *
 * Customized helper functions
 *
 */

// Factory function
const Utilities = function ({ config }) {
  // Parse a JSON string ot an object in all cases without throwing
  this.parseJsonToObject = function (str) {
    try {
      const obj = JSON.parse(str);
      return obj;
    } catch (e) {
      return {};
    }
  };

  // Create a string of alphanumeric characters of a given length
  this.createRandomString = function (strLength) {
    strLength =
      typeof strLength == "number" && strLength > 0 ? strLength : false;
    if (strLength) {
      // Define all possible characters that could go into string
      const possibleCharacters = config.tokenStringGenerator;

      // Initiate the final string
      let str = "";
      for (let i = 1; i <= strLength; i++) {
        // Get a random character from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(
          Math.floor(Math.random() * possibleCharacters.length)
        );

        // Append this character to the final string
        str += randomCharacter;
      }

      // Return the final string
      return str;
    } else {
      return false;
    }
  };
};

// Export the module
module.exports = Utilities;
