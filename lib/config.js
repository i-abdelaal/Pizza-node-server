/*
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};

// Development (default) environment
environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
  hashSecret: "ThisIsASecret",
  tokenRandomNumberGenerator: 20,
  tokenStringGenerator: "abcdefghijklmnopqrstuvwxyz0123456789",

  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  mailgun: {
    privateKey: process.env.MAILGUN_PRIVATE_KEY,
    fromEmail: process.env.MAILGUN_FROM_EMAIL,
    domainName: process.env.MAILGUN_DOMAIN_NAME,
  },
};

// Production environment
environments.production = {
  httpPort: process.env.HTTP_PORT,
  httpsPort: process.env.HTTPS_PORT,
  envName: "production",
  hashSecret: process.env.HASH_SECRET,
  tokenRandomNumberGenerator: process.env.TOKEN_RANDOM_NUMBER_GENERATOR,
  tokenStringGenerator: process.env.TOKEN_STRING_GENERATOR,

  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  mailgun: {
    privateKey: process.env.MAILGUN_PRIVATE_KEY,
    fromEmail: process.env.MAILGUN_FROM_EMAIL,
    domainName: process.env.MAILGUN_DOMAIN_NAME,
  },
};

// Determine which environment was passed as command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// Check that the current environment is one of the defined environments or the default
const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.development;

// Export the module
module.exports = environmentToExport;
