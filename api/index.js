'use strict';

import express from 'express';
import compression from 'compression';
import logger from './logging';

const PORT = process.env.PORT || 8080;

const app = express();
// Use gzip compression (best practice)
app.use(compression());

app.get('/', (req, res) => {
    logger.silly(`Got request to '/': ${req}`);
    res.send('Hello World');
});

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});
