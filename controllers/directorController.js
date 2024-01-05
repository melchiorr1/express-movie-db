const Director = require('../models/director');
const asyncHandler = require("express-async-handler");
const movie = require('../models/movie');

exports.directors = asyncHandler(async (req, res, next) => {
  const directors = await Director.find({}).exec();
  res.render("directors", { title: "Directors", directors });
});

exports.directors_detail = asyncHandler(async (req, res, next) => {
  const director = await Director.findById(req.params.id)
  .populate("comments")
  .exec();
  const movies = await movie.find({ director: req.params.id })
  .sort([["year", "ascending"]])
  .exec();

  res.render("director_detail", { director, movies, comments: director.comments});
});
