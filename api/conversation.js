import ConversationV1 from 'watson-developer-cloud/conversation/v1';
import logger from './logging';
import {conversationCreds} from './credentials/bluemix';
import {enrichMessage} from './enrichment';

const bmConversation = new ConversationV1({
    username: conversationCreds.username,
    password: conversationCreds.password,
    version_date: '2016-07-01'
});

const MIN_CONFIDENCE = .5;

export default class Conversation {
    constructor(){
        this.sendMessage = this.sendMessage.bind(this);
    }
    enrichReply(replyIntent, replyBody, context, input){
        logger.debug('Intent', replyIntent);
        const enrichedMessage = enrichMessage(replyIntent, replyBody, context, input);
        logger.debug('Got enriched message', enrichedMessage);
        return enrichedMessage;
    }
    sendMessage(contextVal, messageBody){
        return new Promise((resolve, reject)=>{
            if(messageBody === 'Ping'){
                return setTimeout(() => resolve('Pong'), 2000);
            }
            bmConversation.message({
                input: { text: messageBody },
                context: contextVal || {},
                workspace_id: '4914c1f5-b44e-4604-be08-9d976b77c33a',
            },
            (error, response)=> {
                if(error){
                    return reject(error);
                }
                console.log(response);
                logger.debug('Got bluemix message', response);
                const intents = response.intents;
                const output = response.output.text.join(' ');
                const context = response.context;
                const input = response.input.text;
                // Check if we have dialog available
                if(output.length < 1) {
                    logger.warn('No output available for message', response);
                    return resolve({ message: 'I can\'t help you with that right now', context: context });
                }
                // Apply enrichment to tokenized data
                return this.enrichReply(intents, output, context, input)
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
