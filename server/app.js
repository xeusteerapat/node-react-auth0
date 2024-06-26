// app.js

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

const { config } = require('./middlewares/oidc');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
});

const store = new RedisStore({ client: redisClient });

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 86400000,
      sameSite: 'lax',
    },
  })
);

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

    req.session.accessToken = response.data.access_token;

    res.send(response.data);
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).send({
      error: error?.response?.data,
    });
  }
});

// app.use(oidc);

app.use(async (req, res, next) => {
  console.log('check session middleware', req.session);
  const token = req.session.accessToken;
  if (!token) return res.sendStatus(401);

  try {
    jwt.verify(token, process.env.AUTH0_API_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(403).send({
      message: error?.response?.data || 'Forbidden',
    });
  }
});

app.get('/', (req, res) => {
  res.send({
    message: 'OK',
  });
});

// TODO: need to research more details about this lib again
// const checkJwt = jwtAuth;

// checkJwt.unless = unless;
// app.use(checkJwt.unless({ path: ['/', '/login', '/auth/:code'] }));

app.get('/profile', (req, res) => {
  const { user } = req;
  console.log('user', user);
  res.send({ message: 'Profile page' });
});

app.get('/protect', (req, res) => {
  console.log('xxxx', req.session);
  res.send({
    message: 'Protected',
  });
});

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
