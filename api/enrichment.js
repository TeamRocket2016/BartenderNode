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
            function passThrough(intentAndMessagePromise){
                return intentAndMessagePromise.then((intentAndMessage)=>{
                    return intentAndMessage;
                });
            }, //TODO: extend
        ];
    // Enrichers that run on specific intents
        this.mappedEnrichers = {
            'greetings': [
                function fakeEnricher(intentAndMessagePromise){
                    return intentAndMessagePromise.then((intentAndMessage)=>{
                        return intentAndMessage;
                    });
                },
            ],
        };
    }

    enrichMessage({intent, confidence}, message){
        const initialIntentAndMessagePromise = Promise.resolve(new IntentAndMessage(intent, message));
        logger.debug('Enriching', intent, message);
        const partialEnrichedIntentMessagePromise = this.generalEnrichers
        .reduce((currentIntentAndMessage, enricher)=>{
            return enricher(currentIntentAndMessage);
        }, initialIntentAndMessagePromise);
      // Get any mapped enrichers
        const intentEnrichers = this.mappedEnrichers[intent];
        logger.debug('Using intent enrichers', intentEnrichers);
        if(intentEnrichers){
            return intentEnrichers.reduce((currentIntentAndMessage, enricher)=>{
                return enricher(currentIntentAndMessage);
            }, partialEnrichedIntentMessagePromise).then((intentAndMessage)=> intentAndMessage.message);
        }
        return partialEnrichedIntentMessagePromise.then((intentAndMessage)=> intentAndMessage.message);
    }
}
