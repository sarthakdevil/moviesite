const express = require('express');
const app = express()
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const passportlocalmongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect('mongodb://127.0.0.1:27017/Movieschema', {});

const Schema = mongoose.Schema;

// Define the User schema
const MovieSchema = new Schema({
  username: { type: String, unique: true },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    validate: {
      validator: function (val) {
        // Email format validation
        const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        return emailRegex.test(val);
      },
      message: 'Invalid Email Address'
    }
  },
  password: {
    type: String,
    validate: {
      validator: function (val) {
        // Password should have at least one lowercase letter and one uppercase letter
        return /^(?=.*[a-z])(?=.*[A-Z])/.test(val);
      },
      message: 'Password must contain at least one lowercase letter and one uppercase letter'
    }
  }
});

MovieSchema.plugin(passportlocalmongoose,{usernameField:'email'});
MovieSchema.plugin(findOrCreate);

// Create the User model
const User = mongoose.model('User', MovieSchema);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      done(err);
    });
});


// Export the User model
module.exports = {User,
  passport};
