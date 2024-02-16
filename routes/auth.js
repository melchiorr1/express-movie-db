const express = require('express');
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureNotAuthenticated } = require("../middleware/ensureAuthenticated");

const router = express.Router();

router.get('/login', ensureNotAuthenticated, authController.login_get);

router.post('/login', ensureNotAuthenticated, authController.login_post);

router.get('/register', ensureNotAuthenticated, authController.register_get);

router.post('/register', ensureNotAuthenticated, authController.register_post);

router.post('/logout', ensureAuthenticated, authController.logout_post);

module.exports = router;