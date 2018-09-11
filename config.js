'use strict';
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/noteful',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/noteful-test',
  CLIENT_ORIGIN: process.env.NODE_ENV === 'production' 
    ? 'https://calm-temple-68738.herokuapp.com' 
    : 'http://localhost:3000',
  GOOGLE_CLIENT_ID: '243766734327-66q96li36m0b4re915i9vjv8jiph9u8n.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'qzuSiEvQWt1VxrE9AvmcLE20',
  WORLD_TIDES_KEY: 'd584b43d-2bd4-40cb-999c-634e60d8202a',

  'facebookAuth' : {
    'clientID'      : 'your-clientID-here',
    'clientSecret'  : 'your-client-secret-here',
    'callbackURL'     : 'http://localhost:3000/api/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

  },

  'googleAuth' : {
    'clientID'         : '243766734327-66q96li36m0b4re915i9vjv8jiph9u8n.apps.googleusercontent.com',
    'clientSecret'     : 'qzuSiEvQWt1VxrE9AvmcLE20',
    'callbackURL'      : 'http://localhost:3000/auth/google/callback'
  }
};