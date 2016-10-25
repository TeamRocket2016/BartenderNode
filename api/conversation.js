import ConversationV1 from 'watson-developer-cloud/conversation/v1';
import logger from './logging';

const bmConversation = new ConversationV1({
    username: '61e2f236-635d-46b4-b695-f4d8f6d7af52',
    password: 'iqwRiQNqHH3b',
    version_date: '2016-07-01'
});

const MIN_CONFIDENCE = .5;

export default class Conversation {
    constructor(){
        this.sendMessage = this.sendMessage.bind(this);
    }
    enrichReply(replyIntent, replyBody){
      //TODO: replace tokens, etc...
        return new Promise((resolve)=>{
            return resolve(replyBody);
        });
    }
    sendMessage(conversationId, messageBody){
        return new Promise((resolve, reject)=>{
          if(messageBody === 'Ping'){
            return setTimeout(() => resolve('Pong'), 2000);
          }
            bmConversation.message({
                input: { text: messageBody },
                context: {conversation_id: conversationId},
                workspace_id: '5a9e5db4-f0a8-4ecf-85b0-c14b681fd943',
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
