const { auth: jwtAuth } = require('express-oauth2-jwt-bearer');

const jwtConfig = {
  audience: process.env.API_BASE_URL,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.AUTH0_API_SECRET, // you can get this from the Auth0 dashboard
  tokenSigningAlg: 'HS256',
};

module.exports = {
  jwtAuth: jwtAuth(jwtConfig),
  jwtConfig,
};
