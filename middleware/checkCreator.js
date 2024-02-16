const Movie = require("../models/movie");
const Director = require("../models/director");

const checkMovieCreator = (async (req, res, next) => {
    const movie = await Movie.findById(req.params.id)
        .populate("createdBy")
        .exec();

  if (req.user.id === movie.createdBy.id || req.user.admin === true) {
    console.log(req.user, movie.createdBy);
    return next();
  }
  res.redirect('/catalog/movies');
});

const checkDirectorCreator = (async (req, res, next) => {
    const director = await Director.findById(req.params.id)
        .populate("createdBy")
        .exec();

  if (req.user.id === director.createdBy.id || req.user.admin === true) {
    return next();
  }
  res.redirect('/catalog/directors');
});

module.exports = { checkMovieCreator, checkDirectorCreator }