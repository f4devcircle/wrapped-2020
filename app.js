const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());

app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

app.get('/', function (req, res) {
  const {
    body
  } = req;

  res.json({
    resultUrl: 'https://google.com',
  });
});

app.use(function (req, res, next) {
  const err = new Error('not found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);
  res.status(err.status || 500);
  res.json({
    error: err,
  });
});

module.exports = app;