'use strict';


const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  city: { type: String, required: true },
  state: { type: String, require: true },
  lat : { type: String, required: true },
  lon: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Add `createdAt` and `updatedAt` fields
favoriteSchema.set('timestamps', true);

module.exports = mongoose.model('Favorite', favoriteSchema);