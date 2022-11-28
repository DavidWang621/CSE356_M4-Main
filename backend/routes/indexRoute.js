var express = require('express');
var router = express.Router();

var indexController = require('../controller/indexController.js');

router.get('/search', indexController.search);

router.get('/suggest', indexController.suggest);

module.exports = router;