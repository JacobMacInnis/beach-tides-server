'use strict';

const express = require('express');
const request = require('request-promise');
const timestamp = require('unix-timestamp');
const moment = require('moment');
var human = require('humanparser');

const { WORLD_TIDES_KEY } = require('./../config');

const Location = require('../models/location');

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
  if (/^\d{3,5}$/.test(location)) {
    filter.zip_code = location;
  } else {
    let address = human.parseAddress(location);
    address.city = address.city[0].toUpperCase() + 
    address.city.slice(1).toLowerCase();
    address.state = address.state.toUpperCase();
    filter.city = address.city;
    filter.state = address.state;
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
        console.log(WorldTideURL);
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