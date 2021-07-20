const express = require('express');
const swagger = require('./swagger');
const xymon = require('./xymon');

const router = express.Router();

router
  .use(express.json())
  .use(express.text())
  .use(swagger)
  .use((req, res, next) => {
    res.format({
      text() {
        res.type('text');
      },
      default() {
        res.type('json');
      },
    });
    next();
  })
  .use(xymon)
  .use((err, req, res, next) => {
    res.status(500).json();
    next();
  })
  .use((req, res, next) => {
    res.status(404).json();
    next();
  });

module.exports = router;
