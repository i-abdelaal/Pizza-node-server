/*
 * This is the handlers index to export all request handlers
 *
 */

// Dependencies
const dep = {};
dep.helpers = require("./../helpers");
dep.config = require("./../config");
dep._data = require("./../data");
dep.Tokens = require("./Tokens");
dep.Users = require("./Users");
dep.Menu = require("./Menu");
dep.Orders = require("./Orders");
dep.services = require("./../services");

// Dependencies Injection
// _tokens need to be initialized first so that it can be used as a dependency
dep._tokens = new dep.Tokens(dep);
const _users = new dep.Users(dep);
const _menu = new dep.Menu(dep);
const _orders = new dep.Orders(dep);
const _purchase = new dep.services.Purchase(dep);

// Container
const handlers = {};

// Define main handler function
const routeHandler = function (route) {
  return function (data, callback) {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
      try {
        route[data.method](data, callback);
      } catch (e) {
        callback(404);
      }
    } else {
      callback(405);
    }
  };
};

// Users handler
handlers.users = routeHandler(_users);

// Tokens handler
handlers.tokens = routeHandler(dep._tokens);

// Menu handler
handlers.menu = routeHandler(_menu);

// Orders handler
handlers.orders = routeHandler(_orders);

// Purchase handler
handlers.purchase = routeHandler(_purchase);

// Ping handler
handlers.ping = function (data, callback) {
  // Callback http status code and payload object
  callback(200, { message: "It works fine" });
};

// Hello handler
handlers.hello = function (data, callback) {
  callback(200, { message: "Hello World!" });
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Export the module
module.exports = handlers;
