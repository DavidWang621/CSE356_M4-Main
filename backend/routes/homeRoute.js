var express = require('express');
var router = express.Router();

var homeController = require('../controller/homeController.js');

router.get('/', homeController.getHome);

module.exports = router;