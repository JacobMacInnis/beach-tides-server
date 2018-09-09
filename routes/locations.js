'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Location = require('../models/location');

const router = express.Router();

router.get('/', (req, res, next) => {
  
  const { location, } = req.query;
  let filter = {};
  
  if (location) filter.zip_code = location;
  
  Location.findOne(filter)
    .then(results => {
      console.log(results);
      res.json('HEY JACOB');
    })
    .catch(err => {
      next(err);
    });

});

module.exports = router;