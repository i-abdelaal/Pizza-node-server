/*
 * This is the services index to export all services factory functions
 *
 */

// Container
const services = {};

// Dependencies Injection
services.Purchase = require("./Purchase");

// Export the module
module.exports = services;
