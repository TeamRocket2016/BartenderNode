'use strict';

import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import logger from './logging';
import Conversation from './conversation';
import SpeechToText from 'watson-developer-cloud/speech-to-text/v1';
import {speech2TextCreds} from '../credentials/bluemix';

const PORT = process.env.PORT || 8080;

const conversation = new Conversation();
const speechToText = new SpeechToText({
    username: speech2TextCreds.username,
    password: speech2TextCreds.password
});

const app = express();
// Use gzip compression (best practice)
app.use(compression());

// Add support for JSON messages
app.use(bodyParser.json());
// Support URL-Encoded Messages
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML/JS/CSS from static folder
app.use(express.static('static'));

const apiRouter = express();

apiRouter.get('/', (req, res) => {
    logger.silly('GET /api');
    res.send('API ONLINE');
});

apiRouter.post('/:sessionId/speechToText', (req, res) => {
    logger.debug('Handling speech to text request'); //TODO: log details
    req.pipe(speechToText.createRecognizeStream({
        content_type: 'audio/ogg;codecs=opus'
    }))
    .on('error', (error)=> logger.error('S2T Error', error))
    .pipe(res)
    .on('error', (error)=> logger.error('S2T Send Error', error))
    .on('finish', ()=> logger.debug('Finished speech recognition request'));
});

apiRouter.post('/:sessionId/newMessage', (req, res) => {
    logger.debug('Got new message:', req.params.sessionId, req.body.messageBody);
    conversation
      .sendMessage(req.params.sessionId, req.body.messageBody)
      .then((reply)=>{
          res.send({messageBody: reply});
      })
      .catch((error)=>{
          logger.error('Conversation failure', req.body.messageBody, error);
      });
});

// Register apiRouter to /api root adress
app.use('/api', apiRouter);

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});
