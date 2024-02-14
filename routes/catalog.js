const express = require("express");
const movieController = require("../controllers/movieController");
const directorController = require("../controllers/directorController");
const { disconnect } = require("mongoose");

const router = express.Router();

router.get('/', movieController.index);

router.get('/movies', movieController.movies);

router.get('/movie/create', movieController.movie_create_get);

router.post('/movie/create', movieController.movie_create_post);

router.post('/movie/:id', movieController.movie_comment_post);

router.get('/movie/:id', movieController.movie_detail);

router.get('/movie/:id/update', movieController.movie_update_get);

router.post('/movie/:id/update', movieController.movie_update_post);

router.get('/movie/:id/delete', movieController.movie_delete_get);

router.post('/movie/:id/delete', movieController.movie_delete_post);

router.get('/directors', directorController.directors);

router.get('/director/create', directorController.director_create_get);

router.post('/director/create', directorController.director_create_post);

router.post('/director/:id', directorController.director_comment_post);

router.get('/director/:id', directorController.directors_detail);

router.get('/director/:id/update', directorController.director_update_get);

router.post('/director/:id/update', directorController.director_update_post);

router.get('/director/:id/delete', directorController.director_delete_get);

router.post('/director/:id/delete', directorController.director_delete_post);

module.exports = router;