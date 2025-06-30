var express = require('express');
var router = express.Router();
var Person = require('../models/person');


/*
var persons = [
        { _id: 1, "Name": "Angelina Jolie" }
    ];
*/

router.get('/persons', function (req, res) {
  console.log("GET api/persons");

  //res.json(persons);
  
  /*
  Person.find({}, function(err, persons) {
    if (err) throw err;
  
    //console.log(persons);
    res.json(persons);
  });
  */
  
  Person.find({})
    .then((persons) => {
      //console.log(persons);
      res.json(persons);
    })
    .catch((err) => {
      throw err;
    });  
 
  
});


module.exports = router;
