'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');


const { CLIENT_ORIGIN } = require('./config');
const { PORT, MONGODB_URI, GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET } = require('./config');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const locationRouter= require('./routes/locations');
const favoritesRouter = require('./routes/favorites');
const indexRouter = require('./routes/index');

// Create an Express application
const app = express(); 

// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// CORS
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

// Parse request body
app.use(express.json());

//auth with google
// app.get('auth/', authRouter);
app.use('/api/v1/', indexRouter)
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/users', usersRouter);
app.use('/api/location', locationRouter);
app.use('/api/favorite', favoritesRouter);

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