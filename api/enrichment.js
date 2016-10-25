import logger from './logging';

function IntentAndMessage(intent, message){
    this.intent = intent;
    this.message = message;
}

export default class Enricher {
    constructor(){
        this.enrichMessage = this.enrichMessage.bind(this);

    // Act on every message
        this.generalEnrichers = [
            function passThrough(intentAndMessage){
                return intentAndMessage;
            }, //TODO: extend
        ];
    // Enrichers that run on specific intents
        this.mappedEnrichers = {
            'greetings': [
                function fakeEnricher(message){
                    return message;
                }, //TODO: extend/implement
            ],
        };
    }

    enrichMessage({intent, confidence}, message){
        const initialIntentAndMessage = new IntentAndMessage(intent, message);
        logger.debug('Enriching', intent, message);
        const partialEnrichedIntentMessage = this.generalEnrichers
        .reduce((currentIntentAndMessage, enricher)=>{
            return enricher(currentIntentAndMessage);
        }, initialIntentAndMessage);
      // Get any mapped enrichers
        const intentEnrichers = this.mappedEnrichers[intent];
        logger.debug('Using intent enrichers', intentEnrichers);
        if(intentEnrichers){
            return intentEnrichers.reduce((currentMesssage, enricher)=>{
                return enricher(currentMesssage);
            }, partialEnrichedIntentMessage.message);
        }
        return partialEnrichedIntentMessage.message;
    }
}
