'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var human = require('humanparser');
const request = require('request-promise');
const passport = require('passport');

const Favorite = require('../models/favorite');
const Location = require('../models/location');
const { WORLD_TIDES_KEY } = require('./../config');

const router = express.Router();

// // Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.use(bodyParser.json());

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
  
  let cities = [];
  let states = [];
  let ids = [];
  let WorldTideURL;
  let favoritesPromises;
  
  Favorite.find(filter)
    .sort({ createdAt: 'desc' })
    .then(results => {
      if (results === null || undefined) {
        const err = new Error('No favorites were found');
        err.status = 404;
        return Promise.reject(err);
      }
      results.forEach(location => {
        cities.push(location.city);
        states.push(location.state);
        ids.push(location._id);
      });
      favoritesPromises = results.map((favObj, index) => {
        WorldTideURL = `https://www.worldtides.info/api?extremes&lat=${favObj.lat}&lon=${favObj.lon}&key=${WORLD_TIDES_KEY}`;
        
        return request(
          {
            url: WorldTideURL
          }
        );
      });
      return Promise.all(favoritesPromises);
    })
    .then((favoritesData) => {
      let favoritesDataCleaned = favoritesData.map(favorite => JSON.parse(favorite));
      favoritesDataCleaned.forEach((favorite, index) => {
        favorite.city = cities[index];
        favorite.state = states[index];
        favorite._id = ids[index];
      });
      res.json(favoritesDataCleaned);
    })
    .catch(err => {
      next(err);
    });
});
/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { newFavorite } = req.body;
  const userId = req.user.id;
  let address = {};
  //***** Never trust users - validate input *****/
  if (!newFavorite) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
  }

  if (isNumeric(newFavorite) === true) {
    address.zip_code = newFavorite;
  } else {
    let city = newFavorite.split(',')[0];
    let state = newFavorite.split(',')[1];
    city = city.toLowerCase();
    city = city[0].toUpperCase() + city.slice(1);
    address.city = city;
    state = state.toUpperCase().trim();
    address.state = state;
  }
  let lat, lon, city, state, WorldTideURL;
  let favoriteSuccess = {
    userId: userId,
  };

  Location.findOne(address)
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
      WorldTideURL = `https://www.worldtides.info/api?extremes&lat=${lat}&lon=${lon}&key=${WORLD_TIDES_KEY}`;
      return request(
        {
          url: WorldTideURL
        });
    })
    .then(response => {
      response = JSON.parse(response);
      if(response.status === 200) {
        favoriteSuccess.city = city;
        favoriteSuccess.state = state;
        favoriteSuccess.lat = lat;
        favoriteSuccess.lon = lon;
      }
      return Favorite.create(favoriteSuccess);
    })
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  /***** validate id *****/
  console.log('step 1');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  console.log('step 2');
  Favorite.find({ _id: id, userId: userId}).remove()
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});


module.exports = router;