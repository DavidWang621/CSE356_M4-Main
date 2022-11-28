var express = require('express');
var router = express.Router();

var collectionController = require('../controller/collectionController.js');

router.post('/create', collectionController.createDoc);

router.post('/delete', collectionController.deleteDoc);

router.get('/list', collectionController.listDocs);

module.exports = router;