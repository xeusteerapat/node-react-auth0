// app.js

const express = require('express');
const cors = require('cors');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { auth: jwtAuth } = require('express-oauth2-jwt-bearer');
const { unless } = require('express-unless');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(cors());

const base64URLEncode = (str) =>
  str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const verifier = base64URLEncode(crypto.randomBytes(64));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}
const challenge = base64URLEncode(sha256(verifier));

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.API_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.OPEN_ID_CONNECT_SECRET_CONFIG, // random string 32 chars
};

app.get('/login', (req, res) => {
  // redirect to fe
  const baseLoginUrl = new URL(`${process.env.AUTH0_DOMAIN}/authorize`);
  const loginParams = new URLSearchParams();

  loginParams.append('response_type', 'code');
  loginParams.append('client_id', config.clientID);
  loginParams.append('state', verifier);
  loginParams.append('redirect_uri', process.env.REDIRECT_URI);
  loginParams.append('code_challenge', challenge);
  loginParams.append('code_challenge_method', 'S256');
  loginParams.append('audience', `${config.baseURL}/`);

  baseLoginUrl.search = loginParams.toString();

  res.redirect(baseLoginUrl.toString());
});

app.use(auth(config));

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/auth/:code', async (req, res) => {
  try {
    const response = await axios.post(`${config.issuerBaseURL}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: config.clientID,
      client_secret: process.env.AUTH0_CLIENT_SECRET, // you can get this from the Auth0 dashboard
      code: req.params.code,
      redirect_uri: process.env.REDIRECT_URI,
      code_verifier: verifier,
      audience: config.baseURL,
    });

    res.send(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).send({
      error: error?.response?.data,
    });
  }
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// Middleware to validate access tokens
const jwtConfig = {
  audience: process.env.API_BASE_URL,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.AUTH0_API_SECRET, // you can get this from the Auth0 dashboard
  tokenSigningAlg: 'HS256',
};

const checkJwt = jwtAuth(jwtConfig);

checkJwt.unless = unless;
// app.use(checkJwt.unless({ path: ['/', '/profile'] }));

app.get('/api/protected', (req, res) => {
  res.send('This is a protected endpoint');
});

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
