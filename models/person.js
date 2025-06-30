var mongoose = require('mongoose');

var personSchema = new mongoose.Schema({ 
  Name: {
        type: String,
        required: [true, 'Name is a required field']
  },
  Role: {
    type : String,
    default : 'Actor',
    enum : ['Actor', 'Director']}
});
var Person = mongoose.model('Person', personSchema, 'persons');

module.exports = Person;
