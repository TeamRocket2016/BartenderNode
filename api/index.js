'use strict';

import express from 'express';
import compression from 'compression';
import logger from './logging';

const PORT = process.env.PORT || 8080;

const app = express();
// Use gzip compression (best practice)
app.use(compression());

app.use(express.static('static'));

app.get('/api', (req, res)=>{
    logger.silly('Request to /api');
    res.send('API ONLINE');
});

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});
