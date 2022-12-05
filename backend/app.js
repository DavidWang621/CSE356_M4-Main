const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var session = require('express-session');
var client = require('./elastic_client');
var queue = require('./queue');
var fs = require('fs');
var env = require('dotenv');
var amqp = require('amqplib/callback_api');
// var MongoStore = require('connect-mongo');
var connectDB = require("./db");
// var MongoDBStore = require('connect-mongodb-session')(session);
// var cors = require('cors');
const app = express();
env.config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var loadRouter = require('./routes/loadRoute');
// var apiRouter = require('./routes/apiRoute');
var usersRouter = require('./routes/usersRoute');
var collectionRouter = require('./routes/collectionRoute');
var mediaRouter = require('./routes/mediaRoute');
var editRouter = require('./routes/editRoute');
var homeRouter = require('./routes/homeRoute');
// var indexRouter = require('./routes/indexRoute');

app.use(express.static(path.join(__dirname, 'public')));

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.set('trust proxy', 1);

// var store = new MongoDBStore({
//   uri: 'mongodb+srv://twice:ilovecse356@cse356.3bebyax.mongodb.net/?retryWrites=true&w=majority',
//   databaseName: 'test',
//   collection: 'mySessions'
// });

// app.use(session({
//   secret: "secret",
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({
//     mongoUrl: 'mongodb+srv://twice:ilovecse356@cse356.3bebyax.mongodb.net/?retryWrites=true&w=majority', 
//     dbname: 'test'
//   }), 
//   cookie: {
//     maxAge: 24 * 360000
//   }
// }));

app.use('/', loadRouter);
// app.use('/api', apiRouter);
app.use('/users', usersRouter);
app.use('/collection', collectionRouter);
app.use('/media', mediaRouter);
app.use('/edit', editRouter);
app.use('/home', homeRouter);
// app.use('/index', indexRouter);
app.use('/', express.static(path.join(__dirname, 'bundle')));

client.createIndex(true);
queue.connectQueue();
connectDB();

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