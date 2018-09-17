'use strict';

const mongoose = require('mongoose');

const userThemeSchema = new mongoose.Schema({
  theme: { type: String, default: 'day' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('UserTheme', userThemeSchema);