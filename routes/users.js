const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res) {
  res.render('register');
});

// Register Proccess
router.post(
  '/register',
  [
    check('name')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Name is required'),
    check('email')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Email is required'),
    check('email')
      .isEmail()
      .trim()
      .withMessage('Email must be valid'),
    check('password')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Password is required'),
    check('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    })
  ],
  (req, res, next) => {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('register', {
        errors: errors.mapped()
      });
      console.log(newUser.password);
      console.log(newUser.password2);
    } else {
      bcrypt.genSalt(10, function(error, salt) {
        bcrypt.hash(newUser.password, salt, function(error, hash) {
          if (error) {
            console.log(error);
          }
          newUser.password = hash;
          newUser.save(function(error) {
            if (error) {
              console.log(error);
              return;
            } else {
              req.flash('success', 'You are now registered and can log in');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
  }
);

// Login FOrm
router.get('/login', function(req, res) {
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/articles/view_articles',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Process
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have been logged out.');
  res.redirect('/');
});

module.exports = router;
