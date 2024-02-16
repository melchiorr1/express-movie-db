const express = require("express");
const movieController = require("../controllers/movieController");
const directorController = require("../controllers/directorController");
const { ensureAuthenticated } = require('../middleware/ensureAuthenticated');
const { checkMovieCreator } = require('../middleware/checkCreator')

const router = express.Router();

router.get('/', movieController.index);

router.get('/movies', movieController.movies);

router.get('/movie/create', ensureAuthenticated, movieController.movie_create_get);

router.post('/movie/create', ensureAuthenticated, movieController.movie_create_post);

router.post('/movie/:id', ensureAuthenticated, movieController.movie_comment_post);

router.get('/movie/:id', movieController.movie_detail);

router.get('/movie/:id/update', checkMovieCreator, ensureAuthenticated, movieController.movie_update_get);

router.post('/movie/:id/update', checkMovieCreator, ensureAuthenticated, movieController.movie_update_post);

router.get('/movie/:id/delete', checkMovieCreator, ensureAuthenticated, movieController.movie_delete_get);

router.post('/movie/:id/delete', checkMovieCreator, ensureAuthenticated, movieController.movie_delete_post);

router.get('/directors', directorController.directors);

router.get('/director/create', ensureAuthenticated, directorController.director_create_get);

router.post('/director/create', ensureAuthenticated, directorController.director_create_post);

router.post('/director/:id', ensureAuthenticated, directorController.director_comment_post);

router.get('/director/:id', directorController.directors_detail);

router.get('/director/:id/update', ensureAuthenticated, directorController.director_update_get);

router.post('/director/:id/update', ensureAuthenticated, directorController.director_update_post);

router.get('/director/:id/delete', ensureAuthenticated, directorController.director_delete_get);

router.post('/director/:id/delete', ensureAuthenticated, directorController.director_delete_post);

module.exports = router;