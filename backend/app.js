const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var client = require('./elastic_client');
var queue = require('./queue');
var fs = require('fs');
var env = require('dotenv');
var amqp = require('amqplib/callback_api');
// var cors = require('cors');
const app = express();
env.config();

// app.use(cors());
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var connectDB = require("./db");
connectDB();

var loadRouter = require('./routes/loadRoute');
var apiRouter = require('./routes/apiRoute');
var usersRouter = require('./routes/usersRoute');
var collectionRouter = require('./routes/collectionRoute');
var mediaRouter = require('./routes/mediaRoute');
var editRouter = require('./routes/editRoute');
var homeRouter = require('./routes/homeRoute');
var indexRouter = require('./routes/indexRoute');

app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(session({
  secret: "super secret key",
  resave: false,
  saveUninitialized: true
}));

app.use('/', loadRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);
app.use('/collection', collectionRouter);
app.use('/media', mediaRouter);
app.use('/edit', editRouter);
app.use('/home', homeRouter);
app.use('/index', indexRouter);
app.use('/', express.static(path.join(__dirname, 'yjs_library')));

client.createIndex(true);
queue.connectQueue();

// let ch = null;
// const opt = { credentials: amqp.credentials.plain('rabbit', 'mq') };
// amqp.connect('amqp://209.94.58.157', opt, function(error0, connection) {
//     if (error0) {
//         throw error0;
//     }
//     connection.createChannel(function(error1, channel) {
//         ch = channel;
//     });
//     // setTimeout(function() {
//     //     connection.close();
//     //     process.exit(0);
//     // }, 500);
// });

// exports.ch = ch;

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});

// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
res.status(err.status || 500);
res.render('error');
});

exports.app = app;