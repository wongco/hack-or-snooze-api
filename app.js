const express = require('express');
const app = express();
const morgan = require('morgan');
const APIError = require('./models/ApiError');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const storiesRoutes = require('./routes/stories');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

//  router middleware
app.use(authRoutes);
app.use('/users', usersRoutes);
app.use('/stories', storiesRoutes);

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
