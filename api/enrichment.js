import logger from './logging';
import {randomDrink, searchByIngredient, multiSearch} from './drinks';

function IntentAndMessage(intent, message){
    this.intent = intent;
    this.message = message;
}

export default class Enricher {
    constructor(){
        this.enrichMessage = this.enrichMessage.bind(this);

        const paramRegex = /\{.*\}/;

    // Act on every message
        this.generalEnrichers = [
            function passThrough(intentAndMessagePromise){
                return intentAndMessagePromise.then((intentAndMessage)=>{
                    return intentAndMessage;
                });
            }, //TODO: extend
            function noWhiteSpace(intentAndMessagePromise){
              return intentAndMessagePromise.then((intentAndMessage)=>{
                intentAndMessage.noWhiteSpace = intentAndMessage.message.replace(/\n/g,'');
                return intentAndMessage;
              });
            },
            function getParams(intentAndMessagePromise){
              return intentAndMessagePromise.then((intentAndMessage)=>{
                const params = (paramRegex).exec(intentAndMessage.noWhiteSpace);
                const MATCH_INDEX = 0;
                if(params){
                  intentAndMessage.params = JSON.parse(params[MATCH_INDEX]);
                }
                return intentAndMessage;
              })
            }
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
            'recommend-drink': [
              function parseParameters(intentAndMessagePromise){
                // All singleSearchFuncs currently use same function
                const singleSearchFuncs = {
                  'alcoholic_drink': searchByIngredient, // Not a mistake
                  'ingredient': searchByIngredient, // Not a mistake
                }
                //TODO: MULTI-SEARCH FUNCTIONS
                function searchSingle(searchKey, param){
                  const searchFunc = singleSearchFuncs[searchKey];
                  if(searchFunc){
                    return searchFunc(param);
                  }
                  logger.warn('Unable to find matching function for ', searchKey);
                  return randomDrink();
                }
                const failMessage = 'beer. I\'m not sure what you want';
                return new Promise((resolve, reject)=>{
                  intentAndMessagePromise.then((intentAndMessage)=>{
                    function insertDrink(drink){
                      intentAndMessage.message = intentAndMessage.noWhiteSpace
                        .replace(paramRegex, drink);
                      console.log('Final intent and message', intentAndMessage);
                      return intentAndMessage;
                    }
                    if(!intentAndMessage.params){
                      reject('No params for recommend-drink');
                    }
                    const params = intentAndMessage.params["recommend-drink"];
                    const paramKeys = Object.keys(params);
                    if(paramKeys.length == 1){
                      const searchKey = paramKeys[0];
                      const param = params[searchKey];
                      logger.silly('Single param', param);
                      searchSingle(searchKey, param)
                        .then((searchResult)=>{
                          const recommendation = (()=>{
                            if(!searchResult || searchResult.length < 1){
                              return failMessage;
                            }
                            return searchResult.pop().strDrink;
                          })();
                          //TODO: get more drink details...
                          intentAndMessage = insertDrink(recommendation);
                          logger.silly('New message', intentAndMessage, recommendation);
                          resolve(intentAndMessage);
                      });
                    } else if(paramKeys.length < 1){
                      randomDrink().then((drink)=>{
                        const recommendation = `${drink.strDrink}: ${drink.strInstructions}`;
                        resolve(insertDrink(recommendation));
                      })
                    } else {
                      logger.debug('Recommending drink based on', params);
                      //TODO!!! MULTI-SEARCH
                      var searchParams = {};
                      searchParams.i = [params.ingredient];
                      searchParams.a = (()=>{
                        const alcoParam = params['alcoholic-drink'];
                        if(!alcoParam){
                          return true; // Assume we want alcohol
                        }
                        return Boolean(alcoParam);
                      })();
                      //TODO: params.c
                      multiSearch(searchParams).then((searchResult)=>{
                        intentAndMessage = (()=>{
                          if(!searchResult || searchResult.length < 1){
                            intentAndMessage.message = 'Sorry try something else';
                            return intentAndMessage;
                          }
                          return insertDrink(searchResult[0].strDrink);
                        })();
                        console.log('Intentandmessage', intentAndMessage);
                        resolve(intentAndMessage);
                      });
                    }
                  });
                });
              }
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
        logger.silly('Using intent enrichers', intentEnrichers);
        if(intentEnrichers){
            return intentEnrichers.reduce((currentIntentAndMessage, enricher)=>{
                return enricher(currentIntentAndMessage);
            }, partialEnrichedIntentMessagePromise)
            .then((intentAndMessage)=> intentAndMessage.message);
        }
        return partialEnrichedIntentMessagePromise
          .then((intentAndMessage)=> intentAndMessage.message);
    }
}
