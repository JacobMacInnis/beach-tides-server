'use strict';
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/tides-app',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/tides-app',
  CLIENT_ORIGIN: process.env.NODE_ENV === 'production' 
    ? 'https://calm-temple-68738.herokuapp.com' 
    : 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  WORLD_TIDES_KEY: process.env.WORLD_TIDES_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};