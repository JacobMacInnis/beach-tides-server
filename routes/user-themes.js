'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const UserTheme = require('../models/user-theme');


const router = express.Router();

// // Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.use(bodyParser.json());

/* ========== GET THEME ========== */
router.get('/', (req, res, next) => {
  
  let filter = {};
  filter.userId = req.user.id;
  
  UserTheme.findOne(filter)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT THEME CHANGE ========== */
router.put('/', (req, res, next) => {
  const userId = req.user.id;
  UserTheme.findOne({userId})
    .then(results => { 
      if (!results) {
        UserTheme.create({userId, theme: 'night'})
          .then(results => {
            res.json(results);
          })
          .catch(err => {
            next(err);
          });
      } else {
        (results.theme === 'night') ? results.theme = 'day' : results.theme = 'night';
        results.save()
          .then(results => {
            res.json(results);
          })
          .catch(err => {
            next(err);
          });      
      }
    });
});

module.exports = router;