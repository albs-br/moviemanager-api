var express = require('express');
var router = express.Router();
var winston = require('winston');
var Genre = require('../models/genre');

/*
var genres = [
        { _id: 1, "Name": "Comedy" },
        { _id: 2, "Name": "Terror" },
        { _id: 3, "Name": "Drama" },
        { _id: 4, "Name": "Action" }
    ];
*/

router.get('/genres', function (req, res) {
  var orderby = req.query.orderby;
  
  winston.info("GET api/genres" + (orderby !== undefined ? "?orderby=" + orderby : ""));
  
  /*
  Genre.find({}, function(err, genres) {
    if (err) throw err;
  
    //console.log(genres);
    res.json(genres);
  });
  */

  /*
  Genre.find({}).sort(orderby).exec(function(err, genres) {
    if (err) throw err;
  
    //console.log(genres);
    res.json(genres);
  });  
  */
  
  Genre.find({}).sort(orderby)
    .then((genres) => {
      //console.log(genres);
      res.json(genres);
    })
    .catch((err) => {
      throw err;
    });
  
});


module.exports = router;
