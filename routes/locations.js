'use strict';

const express = require('express');
const request = require('request-promise');
const timestamp = require('unix-timestamp');
const moment = require('moment');
var human = require('humanparser');

const { WORLD_TIDES_KEY } = require('./../config');

const Location = require('../models/location');
const states = require('./../utils/states');

const router = express.Router();

router.get('/', (req, res, next) => {
  const { location, date } = req.query;
  let filter = {};
  let lat, lon, city, state;
  let dateParams = '';
  if (!location) {
    const err = new Error('Missing `location` in request body');
    err.status = 400;
    return next(err);
  }
  if (/^\d+$/.test(location)) {
    if (/^\d{3,5}$/.test(location)) {
      filter.zip_code = location;
    } else {
      const err = new Error('Zip-Code must have minimum 3 digits and maximum 5 digits');
      err.status = 400;
      return next(err);
    }
  } else {
    if (location.indexOf(',') > -1) {
      let city = location.split(',')[0].trim();
      let state = location.split(',')[1].trim();
      city = city.toLowerCase()
        .split(' ')
        .map(letters => letters.charAt(0).toUpperCase() + letters.substring(1))
        .join(' ');
      filter.city = city;
      if (state.length > 2) {
        state = state.toLowerCase();
        if (states.hasOwnProperty(state)) {
          state = states[state];
          filter.state = state;
        } else {
          const err = new Error('State can not be found');
          err.status = 400;
          return next(err);
        }
      } else {
        state = state.toUpperCase().trim();
        filter.state = state;
      }
    } else {
      const err = new Error('City and State must be separated by a comma');
      err.status = 400;
      return next(err);
    }
  }
  let WorldTideURL;
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
      if (dateParams === '') {
        WorldTideURL = `https://www.worldtides.info/api?extremes&lat=${lat}&lon=${lon}&key=${WORLD_TIDES_KEY}`;
      } else {
        WorldTideURL = `https://www.worldtides.info/api?extremes&lat=${lat}&lon=${lon}&key=${WORLD_TIDES_KEY}${dateParams}`;
      }
      return request(
        {
          url: WorldTideURL
        });
    })
    .then(response => {
      response = JSON.parse(response);
      response.lat = lat;
      response.lon = lon;
      response.city = city;
      response.state = state;
      response.date = date;
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;