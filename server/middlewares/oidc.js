const { auth } = require('express-openid-connect');

/**
 * @ConfigParams
 */
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.API_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.OPEN_ID_CONNECT_SECRET_CONFIG, // random string 32 chars
};

module.exports = {
  oidc: auth(config),
  config,
};
