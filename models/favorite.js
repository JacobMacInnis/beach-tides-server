'use strict';


const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  location: { type: String, required: true },
  lat : { type: String, required: true },
  lon: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Favorite', favoriteSchema);