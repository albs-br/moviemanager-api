var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

// GET user profile.
router.get('/user', ensureLoggedIn, function(req, res, next) {
  console.log("GET api/user");

  //res.render('user', { user: req.user });
  res.json(req.user);
});

module.exports = router;
