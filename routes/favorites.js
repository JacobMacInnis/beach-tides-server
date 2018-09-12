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
  
  filter.userId = userId;
  console.log(userId);
  
  Favorite.find(filter)
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { location } = req.body;
  const userId = req.user.id;
  /***** Never trust users - validate input *****/
  if (!location) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  // if (typeof location === number) {

  // }


  let filter = {};
  if (location) filter.zip_code = location;
  let lat, lon, city, state;
  let dateParams = '';





  const newFavorite = { name: name, userId: userId };

  Favorite.create(newFavorite)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});



module.exports = router;