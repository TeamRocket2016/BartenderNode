import stt from 'watson-developer-cloud/speech-to-text/v1';
import tts from 'watson-developer-cloud/text-to-speech/v1';
import logger from './logging';
import fs from "fs";
import {speech2TextCreds} from '../credentials/bluemix';
import {text2SpeechCreds} from '../credentials/bluemix';

var speech2text = new stt({
    "username": speech2TextCreds.username,
    "password": speech2TextCreds.password
});

var text2speech = new tts({
    "username": text2SpeechCreds.username,
    "password": text2SpeechCreds.password
});


// returns a stream, attach 'data' and 'end' event handlers
function synthesizeText(someString, callback) {
    return text2speech.synthesize({
        text: someString,
        voice: 'en-US_AllisonVoice', // Optional voice
        accept: 'audio/wav' // default is audio/ogg; codec=opus
    });
}

var buffers = [];
var x = synthesizeText("hello world");
x.on('data', function(buffer) {
    buffers.push(buffer);
    //console.log(buffer);
});
x.on('end', function() {
    console.log("done");
});

var y = synthesizeText("This is a test");
y.pipe(fs.createWriteStream("test.wav"));

function recognizeText(someAudioStream, callback) {
    var params = {
        audio: someAudioStream,
        content_type: 'audio/l16; rate=44100'
    }

    speech2text.recognize(params, callback);
}

recognizeText(fs.createReadStream("man1_wb.wav"), (err, res) => {
    if (err) {
        console.log('no');
        console.log(err);
        logger.debug(err);
    }
    else {
        console.log(JSON.stringify(res, null, 2));
    }
});