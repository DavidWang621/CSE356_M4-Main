var express = require('express');
var router = express.Router();

var apiController = require('../controller/apiController.js');

router.get('/connect/:id', apiController.makeDoc);

router.post('/op/:id', apiController.updateDoc);  

router.post('/presence/:id', apiController.insertPresenceInDoc);

module.exports = router;