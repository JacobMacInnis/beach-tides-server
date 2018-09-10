'use strict';
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/noteful',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/noteful-test',
  CLIENT_ORIGIN: process.env.NODE_ENV === 'production' 
  ? 'https://calm-temple-68738.herokuapp.com' 
  : 'http://localhost:3000',
};