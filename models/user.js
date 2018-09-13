'use strict';


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);