'use strict';

import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import logger from './logging';
import Conversation from './conversation';
import {speechToText, makeTextToSpeech, saveTextToSpeech} from './speech';


const PORT = process.env.PORT || 8080;

const conversation = new Conversation();

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
    logger.debug(`Handling speech to text request from
      ${req.params.sessionId}`);
    req.pipe(speechToText.createRecognizeStream({
        content_type: 'audio/ogg;codecs=opus'
    }))
    .on('error', (error)=> logger.error('S2T Error', error))
    .pipe(res)
    .on('error', (error)=> logger.error('S2T Send Error', error))
    .on('finish', ()=> logger.debug('Finished speech recognition request'));
});

apiRouter.post('/:sessionId/textToSpeech', (req, res)=>{
    const messageBody = req.body.messageBody; //TODO why body?
    logger.debug('Handling text to speech request', req.params.sessionId, messageBody);
    //makeTextToSpeech(messageBody).pipe(res);
    saveTextToSpeech(messageBody).then((url)=>{
      res.send(url);
    });//TODO: unhackify
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
