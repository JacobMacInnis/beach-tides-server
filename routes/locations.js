'use strict';

const express = require('express');
const request = require('request-promise');
const timestamp = require('unix-timestamp');
const moment = require('moment');

const { WORLD_TIDES_KEY } = require('./../config');

const Location = require('../models/location');


const router = express.Router();

router.get('/', (req, res, next) => {
  const { location, date } = req.query;
  let filter = {};
  if (location) filter.zip_code = location;
  let lat, lon, city, state;
  let dateParams = '';

  if (!(date === moment().format('YYYY-MM-DD'))) {
    let futureDate = timestamp.fromDate(date);
    dateParams = `&start=${futureDate}`;
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