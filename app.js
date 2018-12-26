/** Express app for hack-or-snooze-API */
const express = require('express');
const app = express();
const validHTTPMethods = require('./helpers/validHTTPMethods');

// don't provide http logging during automated tests
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
  // middleware for logging HTTP requests to console
  const morgan = require('morgan');
  app.use(morgan('tiny'));
}

// class models
const APIError = require('./models/ApiError');

// routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const storiesRoutes = require('./routes/stories');

// middleware for parsing req.body and json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routing control
app.use('/', authRoutes);
app.use('/users', usersRoutes);
app.use('/stories', storiesRoutes);

// restrict http methods on any undefined routes
app.use(validHTTPMethods(['GET']));

/** 404 handler */
app.use(function(req, res, next) {
  const err = new APIError(
    `${req.url} is not a valid path to a Hack-Or-Snooze API resource.`
  );
  err.title = 'Resource Not Found';
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */
app.use(function(err, req, res, next) {
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status, err.title);
  }
  return res.status(err.status).json(err);
});

module.exports = app;
