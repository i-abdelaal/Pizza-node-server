/*
 * Server-related tasks
 *
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");
const path = require("path");
const util = require("util");

const config = require("./config");
const handlers = require("./handlers");
const helpers = require("./helpers");

// Specify server debugger
const debug = util.debuglog("server");

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPs server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
};
server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// All the server logic for http and https server
server.unifiedServer = function (req, res) {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the HTTP method
  const method = req.method.toLowerCase();

  // Get the query string as an object
  const qureyStringObject = parsedUrl.query;

  // Get the request headers as an object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    //Choose the handler this request should go to
    const chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? handlers[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      qureyStringObject,
      method,
      headers,
      payload: helpers.utilities.parseJsonToObject(buffer),
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Set default status code
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Set default payload
      payload = typeof payload == "object" ? payload : {};

      // Convert object to stirng
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response succeeded print in green, otherwise print in red
      if (statusCode == 200 || statusCode == 201) {
        debug(
          "\x1b[32m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      } else {
        debug(
          "\x1b[31m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      }
    });
  });
};

// Define request router
server.router = {
  ping: handlers.ping,
  hello: handlers.hello,
  users: handlers.users,
  tokens: handlers.tokens,
  menu: handlers.menu,
  orders: handlers.orders,
  purchase: handlers.purchase,
};

// Init script
server.init = function () {
  // Define Ports and environment
  const ENV = config.envName;
  const httpPort = config.httpPort;
  const httpsPort = config.httpsPort;

  // Start the HTTP server
  server.httpServer.listen(httpPort, function () {
    // Send to console, in ligh blue
    console.log(
      "\x1b[36m%s\x1b[0m",
      `Server launched on ${httpPort} in ${ENV} mode`
    );
  });

  // Start the HTTPS server
  server.httpsServer.listen(httpsPort, function () {
    // Send to console, in violet
    console.log(
      "\x1b[35m%s\x1b[0m",
      `Server launched on ${httpsPort} in ${ENV} mode`
    );
  });
};

// Export the module
module.exports = server;
