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


// /* ========== POST NEW THEME ========== */
// router.post('/', (req, res, next) => {
//   const userId = req.user.id;
//   const setNewTheme = {
//     userId,
//     theme: 'night'
//   };
  
//   UserTheme.create()  
//     .then(result => {
//       console.log(result);
//       res.location(`${req.originalUrl}/${result.id}`)
//         .status(201)
//         .json(result);
//     })
//     .catch(err => next(err));
// });

/* ========== PUT THEME CHANGE ========== */
router.put('/', (req, res, next) => {
  const { theme } = req.body;
  const userId = req.user.id;
  
  /***** Never trust users - validate input *****/
  // if (!theme) {
  //   const err = new Error('Missing `theme` in request body');
  //   err.status = 400;
  //   return next(err);
  // }
  UserTheme.findOne({userId})
    .then(results => { 
      if (!results) {
        UserTheme.create({userId, theme: 'night'})
          .then(results => {
            console.log(results);
            res.json(results);
          })
          .catch(err => {
            next(err);
          });
      } else {
        (results.theme === 'night') ? results.theme = 'day' : results.theme = 'night';
        results.save()
          .then(results => {
            console.log(results);
            res.json(results);
          })
          .catch(err => {
            next(err);
          });      
      }
    });
});
//     .then(result => {
//       console.log(result, 'Result');
//       res.location(`${req.originalUrl}/${result.id}`)
//         .status(201)
//         .json(result);
//     })
    
//     .catch(err => next(err));
// });

module.exports = router;