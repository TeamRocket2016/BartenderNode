import TextToSpeech from 'watson-developer-cloud/text-to-speech/v1';
import SpeechToText from 'watson-developer-cloud/speech-to-text/v1';
import fs from 'fs';
import {speech2TextCreds} from '../credentials/bluemix';
import {text2SpeechCreds} from '../credentials/bluemix';
import logger from './logging';
const speechToText = new SpeechToText({
    username: speech2TextCreds.username,
    password: speech2TextCreds.password,
});

const textToSpeech = new TextToSpeech({
    username: text2SpeechCreds.username,
    password: text2SpeechCreds.password,
});

const makeTextToSpeech = (messageBody) =>{
    return textToSpeech.synthesize({
        text: messageBody,
        voice: 'en-US_AllisonVoice',
        accept: 'audio/ogg;codecs=opus',
    });
};

// Save to temporary file
const saveTextToSpeech = (messageBody) =>{
    return new Promise((resolve, reject)=>{
        const location = `audio/playback-${Math.floor(Math.random()*100)}.ogg`;
        const fullLocation = `static/${location}`;
        makeTextToSpeech(messageBody)
      .pipe(fs.createWriteStream(fullLocation))
      .on('finish',()=>{
          resolve(location);
          setTimeout(()=>{
              fs.unlink(fullLocation,(error)=>{
                  if(error){
                      throw error;
                  }
                  logger.debug('Deleted file', fullLocation);
              });
          }, 5000);
      })
      .on('error', (error)=>{
          reject(error);
      });
    });
};

export {speechToText, makeTextToSpeech, saveTextToSpeech};
