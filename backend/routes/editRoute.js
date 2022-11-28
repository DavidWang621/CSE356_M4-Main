var express = require('express');
var router = express.Router();

var editController = require('../controller/editController.js');

router.get('/:id', editController.getDocWithId);

module.exports = router;