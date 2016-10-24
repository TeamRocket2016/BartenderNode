'use strict';

import express from 'express';
import compression from 'compression';
import logger from './logging';

const PORT = process.env.PORT || 8080;

const app = express();
// Use gzip compression (best practice)
app.use(compression());

app.use(express.static('static'));

const apiRouter = express();

apiRouter.get('/', (req, res) => {
    logger.silly('GET /api');
    res.send('API ONLINE');
});

apiRouter.post('/:sessionId/speechToText', (req, res) => {
    logger.debug('Handling speech to text request'); //TODO: log details
    //TODO: call speech to text service
    res.status(501).end();
});

apiRouter.post('/:sessionId/newMessage', (req, res) => {
    logger.debug('Got new message'); //TODO: log details
    //TODO
    res.status(501).end();
});

// Register apiRouter to /api root adress
app.use('/api', apiRouter);

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});
