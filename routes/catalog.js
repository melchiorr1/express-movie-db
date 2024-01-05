const express = require("express");
const movieController = require("../controllers/movieController");
const directorController = require("../controllers/directorController");
const { disconnect } = require("mongoose");

const router = express.Router();

router.get('/', movieController.index);

router.get('/movies', movieController.movies);

router.get('/movie/:id', movieController.movie_detail);

router.get('/directors', directorController.directors);

router.get('/director/:id', directorController.directors_detail);

module.exports = router;