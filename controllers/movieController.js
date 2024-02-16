const Movie = require("../models/movie");
const Director = require("../models/director");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const movie = require("../models/movie");
const upload = multer({
  limits: {
    fileSize: 1024 * 1024,
  },
  dest: "public/uploads/",
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const validateMovie = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Title has non-alphanumeric characters."),
  body("director")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Director must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Director has non-alphanumeric characters."),
  body("summary")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Summary must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Summary has non-alphanumeric characters."),
  body("year")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Year must be specified.")
    .isNumeric()
    .withMessage("Year has non-numeric characters."),
];

exports.index = asyncHandler(async (req, res, next) => {
  const [movies, directors, comments] = await Promise.all([
    Movie.countDocuments({}).exec(),
    Director.countDocuments({}).exec(),
    Comment.countDocuments({}).exec(),
  ]);

  res.render("index", { title: "Welcome", movies, directors, comments });
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

exports.movie_create_get = asyncHandler(async (req, res, next) => {
  const directors = await Director.find({}).exec();
  res.render("movie_form", { title: "Create Movie", directors });
});

exports.movie_create_post = [
  upload.single("image"),
  ...validateMovie,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let filepath;
    if (req.file) {
      let path_arr = req.file.path.split(path.sep);
      filepath = path.join("/", path_arr[1], path_arr[2]);
    } else {
      filepath = "";
    }

    const movie = new Movie({
      title: req.body.title,
      director: req.body.director,
      summary: req.body.summary,
      year: req.body.year,
      image: filepath,
    });

    if (!errors.isEmpty()) {
      const directors = await Director.find({}).exec();
      res.render("movie_form", {
        title: "Create Movie",
        directors,
        movie,
        errors: errors.array(),
      });
      return;
    } else {
      await movie.save();
      res.redirect(movie.url);
    }
  }),
];

exports.movie_comment_post = [
  body("comment")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Comment must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Comment has non-alphanumeric characters."),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const movie = await Movie.findById(req.params.id).exec();

    const comment = new Comment({
      username: req.user.username,
      comment: req.body.comment,
      movie: movie._id,
    });

    if (!errors.isEmpty()) {
      res.render("movie_detail", {
        movie,
        comments: movie.comments,
        errors: errors.array(),
      });
      return;
    } else {
      await comment.save();
      movie.comments.push(comment);
      await movie.save();
      res.redirect(movie.url);
    }
  }),
];

exports.movie_delete_post = asyncHandler(async (req, res, next) => {
  // Delete comments associated with the movie
  const movie = await Movie.findById(req.params.id).exec();
  const comments = movie.comments;
  await Comment.deleteMany({ _id: { $in: comments } });
  await movie.deleteOne();
  res.redirect("/catalog/movies");
});

exports.movie_delete_get = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id).populate("comments").exec();
  res.render("movie_delete", { movie, comments: movie.comments });
});

exports.movie_update_get = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id).exec();
  const directors = await Director.find({}).exec();
  res.render("movie_form", { title: "Update Movie", movie, directors });
});

exports.movie_update_post = [
  upload.single("image"),
  ...validateMovie,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let old_movie = await Movie.findById(req.params.id).exec();
    let filepath;
    if (req.file) {
      let path_arr = req.file.path.split(path.sep);
      filepath = path.join("/", path_arr[1], path_arr[2]);
    } else {
      filepath = old_movie.image;
    }

    const movie = new Movie({
      title: req.body.title,
      director: req.body.director,
      summary: req.body.summary,
      year: req.body.year,
      image: filepath,
      _id: req.params.id,
      comments: old_movie.comments,
    });

    if (!errors.isEmpty()) {
      const directors = await Director.find({}).exec();
      res.render("movie_form", {
        title: "Update Movie",
        directors,
        movie,
        errors: errors.array(),
      });
      return;
    } else {
      await Movie.findByIdAndUpdate(req.params.id, movie, {});
      res.redirect(movie.url);
    }
  }),
];
