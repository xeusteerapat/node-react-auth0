// app.js

const express = require('express');
const cors = require('cors');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { auth: jwtAuth } = require('express-oauth2-jwt-bearer');
const { unless } = require('express-unless');

const app = express();

app.use(express.json());
app.use(cors());

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'YOUR_RANDOM_SECRET',
  baseURL: 'http://localhost:5001',
  clientID: 'YOUR_AUTH0_CLIENT_ID',
  issuerBaseURL: 'YOUR_AUTH0_DOMAIN',
};

app.use(auth(config));

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// Middleware to validate access tokens
const jwtConfig = {
  audience: 'localhost:5001',
  issuerBaseURL: 'YOUR_AUTH0_DOMAIN',
  secret: 'YOUR_AUTH0_API_SECRET', // you can get this from the Auth0 dashboard
  tokenSigningAlg: 'HS256',
};

const checkJwt = jwtAuth(jwtConfig);

checkJwt.unless = unless;
app.use(checkJwt.unless({ path: ['/', '/profile'] }));

app.get('/api/protected', (req, res) => {
  res.send('This is a protected endpoint');
});

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
