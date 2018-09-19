'use strict';

require('../models/google-user')();
var passport = require('passport');
var User = require('./../models/google-user');
// var GoogleTokenStrategy = require('passport-google-token').Strategy;
var config = require('./../config');

module.exports = function () {
  var GoogleTokenStrategy;
  if ( process.env.NODE_ENV === 'test' ) {
    GoogleTokenStrategy = require('passport-mocked').Strategy;
    console.log('IF', GoogleTokenStrategy);
  }  else {
    GoogleTokenStrategy = require('passport-google-token').Strategy;
    console.log('ELSE', GoogleTokenStrategy);
  }
  passport.use(new GoogleTokenStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
    });
  }));
};