'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Location = require('../models/location');

const router = express.Router();

router.get('/', (req, res, next) => {
  const { zipcode, } = req.query;
  let filter = {};
  
  if (zipcode) filter.zip_code = zipcode;
  console.log('Hello', req.query.zipcode);

  Location.findOne(filter)
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});

module.exports = router;