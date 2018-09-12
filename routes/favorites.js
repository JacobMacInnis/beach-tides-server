'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Favorite = require('../models/favorite');

const router = express.Router();

const passport = require('passport');

// console.log('INCOMING BEFORE AUTHENTICATION');

// // Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;
  let filter = {};
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }
  // filter.userId = userId;
  console.log(userId);
  filter.city = 'Marblehead';
  
  Favorite.find(filter)
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});



module.exports = router;