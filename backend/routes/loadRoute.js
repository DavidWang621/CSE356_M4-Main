var express = require('express');
var router = express.Router();

var loadController = require('../controller/loadController.js');

// Get Req /ttt
router.get('/', loadController.display);

module.exports = router;