'use strict';

const express = require('express');
const secure = require('express-force-https');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const jwtstrategy = require('./passport/jwt');

const { CLIENT_ORIGIN, PORT, MONGODB_URI, GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET } = require('./config');

const locationRouter= require('./routes/locations');
const favoritesRouter = require('./routes/favorites');
const authRouter = require('./routes/auth');
const userThemeRouter = require('./routes/user-themes');

// Create an Express application
const app = express(); 

// Express middleware to redirect all http requests to https 
if (process.env.NODE_ENV !== 'test') {
  app.use(secure);
}

// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// CORS
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

// Parse request body
app.use(express.json());

// app.use(express.static('./../beach-tides-client/public/index.html'));
//auth with google
app.use('/api/v1', authRouter);

app.use('/api/location', locationRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/user-theme', userThemeRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Connect to DB and Listen for incoming connections

if (process.env.NODE_ENV !== 'test') {

  mongoose.connect(MONGODB_URI)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error(err);
    })
    .then(() => {
      app.listen(PORT, function () {
        console.info(`Server listening on ${this.address().port}`);
      }).on('error', err => {
        console.error(err);
      });
    });
}

module.exports = app; // Export for testing