/*
 *
 * This helper function sends emails via Mailgun API
 *
 */

const Mailgun = function ({ https, querystring, config }) {
  // Send an email via mailgun
  this.sendEmail = function (toEmail, subject, text, callback) {
    // Validate paramiters
    toEmail =
      typeof toEmail == "string" &&
      toEmail.trim().length > 0 &&
      toEmail.trim().indexOf("@") > -1
        ? toEmail.trim()
        : false;
    subject =
      typeof subject == "string" &&
      subject.trim().length > 0 &&
      subject.trim().length <= 78
        ? subject.trim()
        : false;
    text =
      typeof text == "string" && text.trim().length > 0 ? text.trim() : false;
    if (toEmail && subject && text) {
      // Configure the request payload
      const payload = {
        from: config.mailgun.fromEmail,
        to: toEmail,
        subject,
        text,
      };

      // Stringify the payload
      const stringPayload = querystring.stringify(payload);

      // Configure the request details
      const requestDetails = {
        protocol: "https:",
        hostname: "api.mailgun.net",
        method: "POST",
        path: "/v3/" + config.mailgun.domainName + "/messages",
        auth: "api:" + config.mailgun.privateKey,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringPayload),
        },
      };
      // Instantiate the request object
      const req = https.request(requestDetails, function (res) {
        // Grab the status of the sent request
        const status = res.statusCode;

        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          callback(false);
        } else {
          callback("Status code returned was " + status);
        }
      });

      // Bind to the error event so it does not get through
      req.on("error", function (e) {
        callback(e);
      });

      // Add the payload
      req.write(stringPayload);

      // End the request
      req.end();
    } else {
      callback("Given paramiters were missing or invalid");
    }
  };
};

// Export the module
module.exports = Mailgun;
