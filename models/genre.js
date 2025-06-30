var mongoose = require('mongoose');

var genreSchema = new mongoose.Schema({ 
  Name: {
        type: String,
        required: [true, 'Name is a required field']
  }
});
var Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
