var express = require('express');
var router = express.Router();

var usersController = require('../controller/usersController.js');

router.post('/signup', usersController.signUpUser);

router.post('/login', usersController.loginUser);

router.post('/logout', usersController.logoutUser);

router.get('/verify', usersController.verifyUser);

module.exports = router;