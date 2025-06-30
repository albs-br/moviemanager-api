var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

var movieSchema = new mongoose.Schema({ 
  Name: {
        type: String,
        required: [true, 'Name is a required field'],
        unique: [true, 'There is already a movie with this name'],
        trim: true
        //lowercase: true
  },
  Year: { type: Number,  min: 1900, max: 2100 },
  Stars: { type: Number,  min: 1, max: 5 },
  Genre: {type: mongoose.Schema.Types.ObjectId, ref: 'Genre', autopopulate: true},
  Cast: [{type: mongoose.Schema.Types.ObjectId, ref: 'Person', autopopulate: true}],
  Director: {type: mongoose.Schema.Types.ObjectId, ref: 'Person', autopopulate: true},
  Country: {
    type : String,
    default : null,
    enum : [null, 'United States', 'United Kingdom', 'Spain', 'Italy',
            'France', 'Brazil', 'Argentina', 'Mexico', 'Japan']},
  Watched: { type: Date },
  Poster: { type: String }
  
  //stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
  //email: { type: String, trim: true, lowercase: true },
  //created: { type: Date, default: Date.now },
  //ubs: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  /*
  { name : {
    type : String,
    default : 'Val',
    enum : ['Val', 'Valeri', 'Valeri Karpov']
  }
  */
});

movieSchema.plugin(autopopulate);

var Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
