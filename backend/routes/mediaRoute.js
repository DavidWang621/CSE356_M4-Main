var express = require('express');
var mediaController = require('../controller/mediaController.js');

var router = express.Router();

router.post('/upload', mediaController.uploadMedia);

router.get('/access/:mediaid', mediaController.getMedia);

module.exports = router;