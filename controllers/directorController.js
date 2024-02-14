const Director = require("../models/director");
const Comment = require("../models/comment");
const Movie = require("../models/movie");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const multer = require("multer");
const path = require("path");
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

const validateDirector = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth").isISO8601().toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
];

exports.directors = asyncHandler(async (req, res, next) => {
  const directors = await Director.find({}).exec();
  res.render("directors", { title: "Directors", directors });
});

exports.directors_detail = asyncHandler(async (req, res, next) => {
  const director = await Director.findById(req.params.id)
    .populate("comments")
    .exec();
  const movies = await Movie
    .find({ director: req.params.id })
    .sort([["year", "ascending"]])
    .exec();

  res.render("director_detail", {
    director,
    movies,
    comments: director.comments,
  });
});

exports.director_create_get = (req, res, next) => {
  res.render("director_form", { title: "Create director" });
};

exports.director_create_post = [
  upload.single("image"),
  // Validate and sanitize fields.
  ...validateDirector,
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let filepath;
    if (req.file) {
      let path_arr = req.file.path.split(path.sep);
      filepath = path.join("/", path_arr[1], path_arr[2]);
    } else {
      filepath = null;
    }

    const director = new Director({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      image: filepath,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("director_form", {
        title: "Create Director",
        director,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Save author.
    await director.save();
    // Redirect to new author record.
    res.redirect(director.url);
  }),
];

exports.director_comment_post = [
  body("comment")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Comment must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Comment has non-alphanumeric characters."),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username must be specified.")
    .matches(/^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ .,!?-]+$/)
    .withMessage("Username has non-alphanumeric characters."),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const director = await Director.findById(req.params.id)
      .populate("comments")
      .exec();

    const movies = await Movie
      .find({ director: req.params.id })
      .sort([["year", "ascending"]])
      .exec();

    const comment = new Comment({
      username: req.body.username,
      comment: req.body.comment,
      director: director._id,
    });

    if (!errors.isEmpty()) {
      res.render("director_detail", {
        director,
        movies,
        comments: director.comments,
        errors: errors.array(),
      });
      return;
    } else {
      await comment.save();
      director.comments.push(comment);
      await director.save();
      res.redirect(director.url);
    }
  }),
];

exports.director_update_get = asyncHandler(async (req, res, next) => {
  const director = await Director.findById(req.params.id).exec();
  res.render("director_form", { title: "Update Director", director });
});

exports.director_update_post = [
  upload.single("image"),
  ...validateDirector,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let old_director = await Director.findById(req.params.id).exec();
    let filepath;
    if (req.file) {
      let path_arr = req.file.path.split(path.sep);
      filepath = path.join("/", path_arr[1], path_arr[2]);
    } else {
      filepath = old_director.image;
    }

    const director = new Director({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      image: filepath,
      comments: old_director.comments,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("director_form", {
        title: "Update Director",
        director,
        errors: errors.array(),
      });
      return;
    } else {
      await Director.findByIdAndUpdate(req.params.id, director, {});
      res.redirect(director.url);
    }
  }),
];

exports.director_delete_get = asyncHandler(async (req, res, next) => {
  const director = await Director.findById(req.params.id)
    .populate("comments")
    .exec();
  const movies = await Movie.find({ director: req.params.id }).exec();
  res.render("director_delete", {
    director,
    comments: director.comments,
    movies,
  });
});

exports.director_delete_post = asyncHandler(async (req, res, next) => {
  const movies = await Movie.find({ director: req.params.id }).exec();
  if (movies.length > 0) {
    res.render("director_delete", {
      director,
      comments: director.comments,
      movies,
    });
    return;
  } else {
    const director = await Director.findById(req.params.id).exec();
    const comments = director.comments;
    await Comment.deleteMany({ _id: { $in: comments } });
    await director.deleteOne();
    res.redirect("/catalog/directors");
  }
});
