'use strict';

const express = require('express');
const request = require('request-promise');

const Location = require('../models/location');

const router = express.Router();

const worldTidesKey = 'd584b43d-2bd4-40cb-999c-634e60d8202a';

router.get('/', (req, res, next) => {
  
  const { location, date } = req.query;
  let filter = {};
  
  if (location) filter.zip_code = location;
  let lat, lon, city, state;
  
  Location.findOne(filter)
    .then(location => {
      if (location === null || undefined) {
        const err = new Error('The location was not found');
        err.status = 404;
        return Promise.reject(err);
      }
      lat = location.latitude;
      lon = location.longitude;
      city = location.city;
      state = location.state;
    })
    .then(() => {
      return request(
        {
          url: `https://www.worldtides.info/api?extremes&lat=${lat}&lon=${lon}&key=${worldTidesKey}`,
        });
    })
    .then(response => {
      response = JSON.parse(response);
      
      response.lat = lat;
      response.lon = lon;
      response.city = city;
      response.state = state;
      // let extremes = response.extremes;
      // let results = {
      //   lat: lat,
      //   lon: lon,
      //   city: city,
      //   state: state,
      //   extremes: extremes
      // };
      // console.log(response, typeof response);
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;