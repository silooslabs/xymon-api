const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { version, description } = require('../package.json');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xymon API',
      version,
      description: `${description} Command reference detail can be found within the [Xymon client](https://www.xymon.com/help/manpages/man1/xymon.1.html) documentation.`,
    },
  },
  apis: ['./routes/**.js'],
};

const spec = swaggerJsDoc(options);

router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

module.exports = router;
