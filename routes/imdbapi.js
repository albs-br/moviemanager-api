var express = require('express');
var router = express.Router();
var winston = require('winston');
const imdb = require('imdb-api');
var security = require('../security.js');

router.get('/imdbapi', function (req, res) {
  var title = req.query.title;
  var year = req.query.year;

  winston.info('GET api/imdbapi' 
               + (title !== undefined ? '?title=' + title : '')
               + (year !== undefined ? '&year=' + year : '')
              );
  
  if(!security.checkPermission(req, res)) return;
   
 
  imdb.get({ name: title, year: year }, {apiKey: process.env.IMDB_API_KEY, timeout: 30000})
    .then((IMDBmovie) => {

      console.log(IMDBmovie);

      res.json(IMDBmovie);
    })
    .catch((imdbError) => {
      console.error(imdbError);

      //movie.Poster = '/Content/Images/poster_not_found.jpg';

      res.json(imdbError);
    });


});

module.exports = router;
