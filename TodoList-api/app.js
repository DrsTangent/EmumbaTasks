var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var cors = require('cors');
var {infoLogger} = require('./src/logging/logger');
var {errorLogger, errorResponder, invalidPathHandler, assignHTTPError} = require('./src/middlewares/errorhandling');


require('dotenv').config();

global.__basedir = __dirname;
  
var usersRouter = require('./src/routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('combined', {stream: infoLogger.stream}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: true, credentials: true }))

require('./src/middlewares/schedule-tasks').start();

app.use('/users', usersRouter);


//Assign Errors to Code
app.use(assignHTTPError);

// Attach the first Error handling Middleware
// function defined above (which logs the error)
app.use(errorLogger)

// Attach the second Error handling Middleware
// function defined above (which sends back the response)
app.use(errorResponder)

// Attach the fallback Middleware
// function which sends back the response for invalid paths)
app.use(invalidPathHandler)

module.exports = app;
