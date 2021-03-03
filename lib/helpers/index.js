/*
 * This is the helpers index to export all helper functions
 *
 */

// Dependencies
const dep = {};
dep.crypto = require("crypto");
dep.querystring = require("querystring");
dep.https = require("https");
dep.config = require("./../config");
dep.Stripe = require("./Stripe");
dep.Mailgun = require("./Mailgun");
dep.Crypt = require("./Crypt");
dep.Utilities = require("./Utilities");

// Container
const helpers = {};

// Dependencies injection
helpers.stripe = new dep.Stripe(dep);
helpers.mailgun = new dep.Mailgun(dep);
helpers.crypt = new dep.Crypt(dep);
helpers.utilities = new dep.Utilities(dep);

// Export the module
module.exports = helpers;
