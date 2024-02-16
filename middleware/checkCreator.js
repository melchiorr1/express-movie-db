const Movie = require("../models/movie");

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

module.exports = { checkMovieCreator }