import ConversationV1 from 'watson-developer-cloud/conversation/v1';
import logger from './logging';
import {conversationCreds} from './credentials/bluemix';
import Enricher from './enrichment';

const bmConversation = new ConversationV1({
    username: conversationCreds.username,
    password: conversationCreds.password,
    version_date: '2016-07-01'
});

const MIN_CONFIDENCE = .5;

const enricher = new Enricher();

export default class Conversation {
    constructor(){
        this.sendMessage = this.sendMessage.bind(this);
    }
    enrichReply(replyIntent, replyBody){
        logger.debug('Intent', replyIntent);
        const enrichedMessage = enricher.enrichMessage(replyIntent, replyBody);
        console.log('Enriched message', enrichedMessage);
        logger.debug('Got enriched message', enrichedMessage);
        return enrichedMessage;
    }
    sendMessage(conversationId, messageBody){
        return new Promise((resolve, reject)=>{
            if(messageBody === 'Ping'){
                return setTimeout(() => resolve('Pong'), 2000);
            }
            bmConversation.message({
                input: { text: messageBody },
                context: {conversation_id: conversationId},
                workspace_id: '40956776-c427-422f-9424-2d2adb5af413',
            },
        (error, response)=> {
            if(error){
                return reject(error);
            }
            logger.debug('Got bluemix message', response);
            const intents = response.intents;
            const output = response.output.text;
            // Check conversation confidence level
            if(intents.length < 0 ||
              intents[0].confidence < MIN_CONFIDENCE) {
                logger.verbose('Low confidence', messageBody, intents);
                return resolve('Sorry, what did you want?');
            }
            // Check if we have dialog available
            if(output.length < 1) {
                logger.warn('No output available for message', response);
                return resolve('I can\'t help you with that right now');
            }
            // Apply enrichment to tokenized data
            return this.enrichReply(intents[0], output[0])
              .then((replyMessage)=>{
                  resolve(replyMessage);
              })
              .catch((error)=>{
                  logger.error('Enrichment failure', error);
                  reject(error);
              });
        });
        });
    }
}
