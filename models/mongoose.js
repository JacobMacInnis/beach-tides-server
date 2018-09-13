'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


module.exports = function () {
  // THIS IS HARDCODED FOR ONLY LOCAL DB 
  var db = mongoose.connect('mongodb://localhost/tides-app');

  var UserSchema = new Schema({
    email: {
      type: String, required: true,
      trim: true, unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    googleProvider: {
      type: {
        id: String,
        token: String
      },
      select: false
    }
  });

  UserSchema.set('toJSON', {getters: true, virtuals: true});

  UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
      'googleProvider.id': profile.id
    }, function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          firstName: profile.name.givenName,
          email: profile.emails[0].value,
          googleProvider: {
            id: profile.id,
            token: accessToken
          }
        });
        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  };

  mongoose.model('User', UserSchema);

  return db;
};