//
// This specifies GET routes for your root URL '/', as well as '/login', '/logout' and '/callback'.
//

var express = require('express');
var passport = require('passport');
var router = express.Router();

// TODO: to verify if this variable is really needed
/*
var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};
*/

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', env: env });
});
*/

// Commenting out as this looks like it's not used

/*
router.get('/login',
  function(req, res){
    console.log('GET /login');
    
    //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    //console.log(fullUrl);
  
    var url = 'http://moviemanager.azurewebsites.net';
    res.redirect(url);
    
    //res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    console.log('GET /callback');
    //console.log(req);
    //console.log(res);
    res.redirect(req.session.returnTo || '/api/user');
  });

module.exports = router;

*/