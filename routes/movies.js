var express = require('express');
var router = express.Router();
var winston = require('winston');
var Movie = require('../models/movie');
const imdb = require('imdb-api');
var fs = require('fs');
var security = require('../security.js');

/*
var movies = [
    { _id: 1, Name: "Rambo", Year: 1985, Genre: { _id: 4, Name: "Action" } },
    { _id: 2, Name: "Rocky", Year: 1978, Stars: 3 },
    { _id: 3, Name: "Minions", Year: 2015 },
    { _id: 4, Name: "Argo (from Express JS running on node!)", Year: 2012 },
    { _id: 5, Name: "Terminator 2", Stars: 5 },
    { _id: 6, Name: "Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan" }
];
*/

router.get('/movies', function (req, res) {
  let orderby = req.query.orderby;
  
  let limit = req.query.limit;
  let offset = req.query.offset;

  var name = req.query.name;
  var year = req.query.year;
  var stars = req.query.stars;
  var country = req.query.country;
  var watchedfrom = req.query.watchedfrom; // date in format yyyy-MM-dd
  var watchedto = req.query.watchedto; // date in format yyyy-MM-dd

  winston.info('GET api/movies');
  winston.info(req.query);

  //MyModel.find({ name: 'john', age: { $gte: 18 }}, function (err, docs) {});
  
  var filter = {};
  
  if(name !== undefined) {
    filter.Name = { $regex: '.*' + name + '.*', $options: 'i' };
  }

  if(year !== undefined) {
    filter.Year = year;
  }

  if(stars !== undefined) {
    filter.Stars = stars;
  }

  if(country !== undefined) {
    filter.Country = country;
  }

  function parseDate(date, endOfDay) {
    if(date === undefined) return undefined;

    let arr = date.substring(0, 10).split('-');
    let year = arr[0];
    let month = arr[1] - 1; // 0 based index
    let day = arr[2];
    
    let returnDate = new Date(year, month, day);
    
    if(endOfDay) {
      returnDate.setHours(23, 59, 59, 999)
    }
    
    return returnDate;
  }
  
  let dateWatchedFrom = parseDate(watchedfrom);
  let dateWatchedTo = parseDate(watchedto, true);
  
  //winston.info(dateWatchedFrom);
  //winston.info(dateWatchedTo);
  
  if(dateWatchedFrom !== undefined && dateWatchedTo !== undefined) {
    filter.Watched = { $gte: dateWatchedFrom, $lte: dateWatchedTo };
  }
  else if(dateWatchedFrom !== undefined) {
    filter.Watched = { $gte: dateWatchedFrom };
  }
  else if(dateWatchedTo !== undefined) {
    filter.Watched = { $lte: dateWatchedTo };
  }
  
  //filter.Watched = { $gte: new Date(2018, 11, 1) }; //[debug]
  //filter.Watched = { $gte: new Date(2018, 11, 1), $lte: new Date(2018, 11, 31) }; //[debug]
  //winston.info(filter);
  
  //winston.info()
  
  if(limit !== undefined) {
    limit = parseInt(limit);
  }
  if(offset !== undefined) {
    offset = parseInt(offset);
  }

  /*
  Movie
    .find(filter)
    .sort(orderby)
    .skip(offset)
    .limit(limit)
    .exec(function(err, movies) {
    if (err) throw err;

    //console.log(movies);

    res.json(movies);

  });
  */
  
  Movie
    .find(filter)
    .sort(orderby)
    .skip(offset)
    .limit(limit)
    .then((movies) => {
    
      //console.log(movies);
      res.json(movies);
    
  }).catch((err) => {
    throw err;
  });  
  
  
});

router.get('/movies/:movie_id', function (req, res) {
  winston.info("GET api/movies/%s", req.params.movie_id);
  
    
  var id = req.params.movie_id;

  Movie.findById(id)
    .then((movie) => {

      if (movie) {
        res.json(movie);
      }
      else {
        winston.info('Movie id ' + id + ' not found');
        res.sendStatus(404); // 404 Not Found - When a non-existent resource is requested
      }
    })
    .catch((err) => {
      throw err;
    });
  
});

router.post("/movies", function (req, res) {
  winston.info("POST api/movies");
  
  if(!security.checkPermission(req, res)) return;
  
  var watched = req.body.Watched || Date();
  
  var movie = new Movie({ 
    Name: req.body.Name,
    Year: req.body.Year,
    Stars: req.body.Stars,
    Genre: req.body.Genre,
    Cast: req.body.Cast,
    Director: req.body.Director,
    Country: req.body.Country,
    Watched: watched,
    Poster: req.body.Poster
  });

  /*
  movie.save(function (err, saved) {
    if (err) throw err;

    //console.log('movie saved sucessfully');
    
    backupMovies();
    
    returnPopulated(saved, res);
  });
  */
  
  movie.save()
    .then((saved) => {

      //console.log('movie saved sucessfully');

      backupMovies();

      returnPopulated(saved, res);

    })
    .catch((err) => {
      throw err;
    });  
  
});

router.put("/movies/:movie_id", function (req, res) {
  winston.info("PUT api/movies/%s", req.params.movie_id);
  
  if(!security.checkPermission(req, res)) return;

  var id = req.params.movie_id;
    
  var movie = {
    Name: req.body.Name,
    Year: req.body.Year,
    Stars: req.body.Stars,
    Genre: req.body.Genre,
    Cast: req.body.Cast,
    Director: req.body.Director,
    Country: req.body.Country,
    Watched: req.body.Watched,
    Poster: req.body.Poster
  };
  
  console.log(movie);
  
  //http://stackoverflow.com/questions/30419575/mongoose-findbyidandupdate-not-returning-correct-model  
  Movie.findByIdAndUpdate(id, movie, {new: true})
    .then((updated) => {
  
      //console.log('movie updated sucessfully');

      backupMovies();

      returnPopulated(updated, res);
    })
    .catch((err) => {
      throw err;
    });
});

router.put("/movies/:movie_id/evaluate/:stars", function (req, res) {
  winston.info("PUT api/movies/%s/evaluate/%s", req.params.movie_id, req.params.stars);

  if(!security.checkPermission(req, res)) return;

  var id = req.params.movie_id;
  var stars = req.params.stars;

  /*
  Movie.findByIdAndUpdate(id, { Stars: stars }, { new: true }, function(err, updated) {
    if (err) throw err;
  
    //console.log('movie evaluated sucessfully');

    backupMovies();

    returnPopulated(updated, res);
  });
  */
  
  Movie.findByIdAndUpdate(id, { Stars: stars }, { new: true })
    .then((updated) => {
      //console.log('movie evaluated sucessfully');

      backupMovies();

      returnPopulated(updated, res);
    })
    .catch((err) => {
      throw err;
    });  
  
});

router.delete("/movies/:movie_id", function (req, res) {
  winston.info("DELETE api/movies/%s", req.params.movie_id);

  if(!security.checkPermission(req, res)) return;
  
  var id = req.params.movie_id;
  
  Movie.findByIdAndRemove(id)
    .then((removed) => {

      winston.info('Movie removed sucessfully');

      backupMovies();

      returnPopulated(removed, res);
    })
    .catch((err) => {
      throw err;
    });  

});

function checkPermission(req, res) {
  var user = req.user.email;
  
  var allowedUsers = [ 'albs_br@yahoo.com.br', 'otheruser@gmail.com' ];
  
  if(!allowedUsers.includes(user)) { 
    winston.info('Permission denied');
    
    res.sendStatus(403); 
    
    return false;
  }
  
  return true;
}

function returnPopulated(original, res) {
  /*
  Movie.populate(original, 'Genre Cast Director', function (err, populated) {
    if (err) throw err;
    res.json(populated);
  });
  */
  
  Movie.populate(original, 'Genre Cast Director')
    .then((populated) => {

      //console.log(populated);
      res.json(populated);

    })
    .catch((err) => {
      throw err;
    });  
  
}

// Saves all movies to a backup file
function backupMovies() {
  //var testData = 'test string 03'; //{ test: 'test' };
  //console.log('saving bkp file');

  //var filename = __dirname + '/.data/bkp/movies.json';
  //var filename = '/app/.data/bkp/movies.json';
  var currentDatetime = new Date()
        .toLocaleString('pt-BR', { timeZone: 'UTC' })
        .replace(/\//g, '-')
        .replace(/:/g, '-')
        .replace(/,/g, '');
  var filename = process.env.BKP_FILEPATH + 'movies ' + currentDatetime + '.json';

  /*
  Movie.find({}).exec(function(err, movies) {
    if (err) throw err;
  
    //console.log(movies);
    
    //console.log('filename: ' + filename);
    fs.writeFile(filename, movies, 'utf8', function (err) {

      if(err) { 
        winston.error('Error while backing up movies. Err: ' + err);
        return;
      }

      winston.info('Backup file successfully saved to ' + filename);

      //console.log('bkp file saved');
      //res.json(movies);

      //fs.readFile(filename, 'utf8', function(err, data) {
      //  console.log(data);
      //});

    });    
  */
  
  Movie.find({})
    .then((movies) => {
        //console.log(movies);

        //console.log('filename: ' + filename);
        fs.writeFile(filename, JSON.stringify(movies), 'utf8', function (err) {

          if(err) {
            winston.error('Error while backing up movies. Err: ' + err);
            return;
          }

          winston.info('Backup file successfully saved to ' + filename);

          //console.log('bkp file saved');
          //res.json(movies);

          //fs.readFile(filename, 'utf8', function(err, data) {
          //  console.log(data);
          //});

          });
      })
    .catch((err) => {
      throw err;
    });  
  
}

module.exports = router;
