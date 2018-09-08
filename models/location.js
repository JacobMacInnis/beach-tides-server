'use strict';

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  zip_code: { type: Number },
  latitude : { type: Number },
  longitude: { type: Number },
  city: { type: String },
  state: { type: String }
});

module.exports = mongoose.model('Location', locationSchema);
