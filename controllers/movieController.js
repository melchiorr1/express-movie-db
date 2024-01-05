const Movie = require("../models/movie");
const Director = require("../models/director");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [movies, directors, comments] = await Promise.all([
    Movie.countDocuments({}).exec(),
    Director.countDocuments({}).exec(),
    Comment.countDocuments({}).exec(),
  ]);

  res.render("index", { title: "Welcome", movies, directors, comments});
});

exports.movies = asyncHandler(async (req, res, next) => {
  const movies = await Movie.find({}).exec();
  res.render("movies", { title: "Movie List", movies });
});

exports.movie_detail = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id)
  .populate("director")
  .populate("comments")
  .exec();

  res.render("movie_detail", { movie, comments: movie.comments });
});
