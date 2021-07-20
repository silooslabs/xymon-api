const env = require('dotenv');
const express = require('express');
const logger = require('morgan');
const debug = require('debug')('api:http');

const routes = require('./routes');

const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

env.config();

const app = express();

app.use(logger(logFormat));
app.use(routes);

const server = app.listen(process.env.PORT || 8081, () => {
  const { address, port } = server.address();

  debug('Listening at http://%s:%s', address, port);
});
