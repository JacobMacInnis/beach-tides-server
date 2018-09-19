'use strict';

require('../models/google-user')();
var passport = require('passport');
var User = require('./../models/google-user');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var config = require('./../config');

module.exports = function () {

  passport.use(new GoogleTokenStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET
  },
  function (accessToken, refreshToken, profile, done) {
    User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
      return done(err, user);
    });
  }));
};