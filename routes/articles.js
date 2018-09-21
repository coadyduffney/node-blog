const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// Bring in Article & User Model
let Article = require('../models/article');
let User = require('../models/user');

// Add Article Route
router.get('/add', ensureAuthenticated, function(req, res) {
  res.render('add_article', {
    title: 'Add Article'
  });
});

// View Articles Route
router.get('/view_articles', function(req, res) {
  let authors = [];
  Article.find(function(err, articles) {
    articles.forEach(article => {
      User.findById(article.author, function(err, user) {
        if (article.author == user._id) {
          authors.push(user.name);
          console.log(authors);
        } else {
          console.log(err);
        }
      });
    });
    // console.log(authors);
    res.render('view_articles', {
      articles: articles
    });
  });
});

// Add Article Submit POST Route
router.post(
  '/add',
  [
    check('title')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Title required'),
    // check('author')
    //   .isLength({ min: 1 })
    //   .trim()
    //   .withMessage('Author required'),
    check('body')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Body required')
  ],
  (req, res, next) => {
    let article = new Article({
      title: req.body.title,
      author: req.user._id,
      body: req.body.body
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('add_article', {
        article: article,
        errors: errors.mapped()
      });
    } else {
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(err => {
        if (err) throw err;
        req.flash('success', 'Article Sucessfully Added.');
        res.redirect('/articles/view_articles');
      });
    }
  }
);

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if (article.author != req.user._id) {
      req.flash('danger', 'You are not authorized to edit this article.');
      return res.redirect('/articles/view_articles');
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res) {
  let article = {};
  article.title = req.body.title;
  // article.author = user.name;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article updated succesfully.');
      res.redirect('/articles/view_articles');
    }
  });
});

// DELETE article
router.delete('/:id', function(req, res) {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };
  Article.findById(req.params.id, function(err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function(err) {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

// Get Single Article
router.get('/:id', function(req, res) {
  console.log(req.params.id);
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author, function(err, user) {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login.');
    res.redirect('/users/login');
  }
}

function getTimeStamp(article) {}

module.exports = router;
