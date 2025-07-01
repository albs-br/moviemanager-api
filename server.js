var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');
var _ = require('underscore');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var winston = require('winston');

var pjson = require('./package.json');

var Movie = require('./models/movie');
var Genre = require('./models/genre');
var Person = require('./models/person');

//var routeIndex = require('./routes/index');
var routeMovies = require('./routes/movies');
var routeGenres = require('./routes/genres');
var routePersons = require('./routes/persons');
var routeUser = require('./routes/user');
var routeContact = require('./routes/contact');
var routeImdbApi = require('./routes/imdbapi');


//console.info("teste4");


// ES6 format strings:
//let soMany = 10; // let defines a variable on current scope, instead of var, which defines on global scope
//console.log(`This is ${soMany} times easier!`); // note the use of string delimiters ` instead of ' or "


// Force HTTPS (https://support.glitch.com/t/force-glitch-projects-to-use-https/5918/2)
const FORCE_HTTPS = false; // Use this to control the force of HTTPS!

function checkHttps(req, res, next){
  // protocol check, if http, redirect to https
  
  if(req.get('X-Forwarded-Proto').indexOf("https") != -1){
    return next()
  } else {
    res.redirect('https://' + req.hostname + req.url);
  }
}

if (FORCE_HTTPS) // This is what forces HTTPS! Cool right?
{
    app.all('*', checkHttps);
}



// Using express-jwt to protect the API
//let jwt = require('express-jwt');
var { expressjwt: jwt } = require("express-jwt");
/*
let jwtCheck = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
  })
  //.unless({path: ['/api/messages']})  // ignore (don't protect) route
;
*/
//deprecated since v10.0.0 - Use `Buffer.from(string[, encoding])` instead.
//let jwtCheck = jwt({ secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'), algorithms: ["HS256"] });
let jwtCheck = jwt({
    secret: Buffer.from(process.env.AUTH0_CLIENT_SECRET, 'base64'), 
    algorithms: ["HS256"] 
});


app.use('/api', jwtCheck);

//app.use('/api/movies', jwtCheck);
//app.use('/api/genres', jwtCheck);


// This will configure Passport to use Auth0
/*
var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function(routeUser, done) {
  done(null, routeUser);
});

passport.deserializeUser(function(routeUser, done) {
  done(null, routeUser);
});
*/


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


app.use('/api', bodyParser.json()); // for parsing application/json
//app.use(methodOverride());


//Set response header with api version
app.use('/api', function (req, res, next) {
  const version = pjson.version;
  res.header('api-version', version);
  next();
});


// Enable CORS
app.use('/api', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //TODO: when go to production, limit to the allowed clients
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, HEAD, OPTIONS, PUT, DELETE"); // TODO: what about PATCH method?
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
  next();
});

// Set content type GLOBALLY for any response.
/*
app.use(function (req, res, next) {
  res.contentType('application/json');
  next();
});
*/




// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
let dbUri = process.env.DB_PROT + 
          '://' + process.env.DB_USER + 
          ':' + process.env.DB_PASS + 
          '@' + process.env.DB_HOST + 
          //':' + process.env.DB_PORT + 
          '/' + process.env.DB_NAME;

// MongoDB Atlas uri connection string:
// mongodb+srv://mongodb_atlas_user:zcIOlfBuVMf2cxlO@cluster0-tuhmi.mongodb.net/test?retryWrites=true

//console.log(dbUri);

let mongooseOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  //MongoParseError: options usefindandmodify, usecreateindex are not supported
  //useFindAndModify: false,
  //useCreateIndex: true
};

/*
mongoose.connect(dbUri, mongooseOptions, function(err) {
    if (err) { 
      //throw err 
      console.error(err);
    }
});
*/
mongoose.connect(dbUri, mongooseOptions)
  .catch(error => console.error(error));

// alternative way to set properties:
//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);

//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function() {
//  console.log("we're connected!");
//});




//Setting up winston logger
/**
 * Requiring `winston-mongodb` will expose
 * `winston.transports.MongoDB`
 */
require('winston-mongodb').MongoDB;

let options = {
  useUnifiedTopology: true,
  db: dbUri,
  level: 'error'
};
winston.configure({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: __dirname + process.env.LOG_FILEPATH + 'moviemanager-api.log',
      level: 'error'
    }),
    new (winston.transports.MongoDB)({
      db: dbUri,
      level: 'error',
      options: {
        useUnifiedTopology: true
      }
    })
  ]
});

//winston.add(winston.transports.MongoDB, options);//[debug] // stop working after db migration to Atlas
//winston.add(new winston.transports.MongoDB(options));

// Testing winston logging
//winston.log('info', 'Hello distributed log files!');
//winston.info('Testing winston logging to MongoDB');
//winston.error('Testing winston error level log');




// More passport configuration
//app.use(passport.initialize());
//app.use(passport.session());



// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//app.use('/', routeIndex);



app.use('/api', prettyPrintJSON);

app.use('/api', routeMovies);
app.use('/api', routeGenres);
app.use('/api', routePersons);
app.use('/api', routeUser);
//app.use('/api', routeContact);
app.use('/api', routeImdbApi);




// error handling ( http://expressjs.com/en/guide/error-handling.html )
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);




// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});




function prettyPrintJSON(req, res, next) {
  var pretty = req.query.pretty;
  
  //console.log("req.query.pretty: " + req.query.pretty);
  //console.log("req.originalUrl: " + req.originalUrl);
  
  if(pretty === "true") {
    app.set('json spaces', 2);
  }
  
  next();
}

function logErrors(err, req, res, next) {
  winston.error(err);
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    //res.status(500).send({ error: 'Something failed!' });
    console.error(err);
    res.status(500).send(err.message);
  }
  else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status);
  res.json(err);
}
