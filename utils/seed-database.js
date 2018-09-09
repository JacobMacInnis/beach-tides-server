'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const User = require('../models/user');
const Favorite = require('../models/favorite');
const Location = require('../models/location');

const seedUsers = require('../db/seed/users');
const seedFavorites = require('../db/seed/favorites');
const seedLocations = require('../db/seed/locations');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      User.insertMany(seedUsers),
      Favorite.insertMany(seedFavorites),
      Location.insertMany(seedLocations)
    ]);
  })
  .then((results) => {
    console.log(`Inserted ${results[0].length} Users, ${results[1].length} Favorites, and ${results[2].length} Locations!`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  })