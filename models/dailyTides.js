'use strict';

const mongoose = require('mongoose');

var tidesSchema = new mongoose.Schema({ dt: Number, date: Date, height: Number, type: String });

const dailyTidesSchema = new mongoose.Schema({ 
  date: { type: String },
  zip_code: { type: Number }, 
  latitude : { type: Number },
  longitude: { type: Number },
  city: { type: String },
  state: { type: String },
  tideData: [tidesSchema]
});

module.exports = mongoose.model('DailyTides', dailyTidesSchema);