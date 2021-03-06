'use strict';
var express = require('express');
var router = express.Router();
var { generateToken, sendToken } = require('../utils/token.utils');
var passport = require('passport');
var config = require('../config');
const request = require('request');
require('../passport/passport')();

router.route('/auth/google')
  .post(passport.authenticate('google-token', {session: false}), function(req, res, next) {
    if (!req.user) {
      return res.send(401, 'User Not Authenticated');
    }
    req.auth = {
      id: req.user.id,
      email: req.user.email
    };
    next();
  }, generateToken, sendToken);

module.exports = router;