import logger from './logging';
import {
  randomBeer,
  searchBeer,
  searchByIngredient,
  combinedSearch
} from './drinks';

function IntentAndMessage(intent, message){
    this.intent = intent;
    this.message = message;
}

function enrichMessage(intent, message, context, input) {
    function cleanContext(dirtyContext){
      return {
        system: dirtyContext.system,
        conversation_id: dirtyContext.conversation_id,
      };
    }
    if (context.hasOwnProperty('search')) {
        if (context.hasOwnProperty('ingredient')) {
            const ingredient = context.ingredient;
            return searchByIngredient(ingredient).then((drinks)=>{
                // use top 5
                let someDrinks = drinks.slice(0, 5);
                let drinksStr = '';
                for (let drink in someDrinks) {
                    drinksStr += someDrinks[drink].strDrink;
                    drinksStr += '; ';
                }

                //replace {0} in message with drinks
                message = message.replace(/\{.*\}/, drinksStr);
                if (drink.description) {
                    message += 'Here\'s how it\'s made: ' + drink.description + '.';
                }

                //send message along
                return { 'message': message, 'context': cleanContext(context) };
            });
        } else if (context.search === 'beer') {
            console.log('Beering'); //TODO: remove
            function mkBeerMessage(drink) {
                if(!drink){
                    logger.warn('Unable to find drink', input);
                    message = 'I can\'t find your beer, sorry.';
                } else  {
                    //replace {0} in message with drinks
                    message = message.replace(/\{.*\}/, drink.name);
                    message += '. ';
                    if (drink.description) {
                        message += drink.description + '.';
                    }else{
                      console.log('No description for beer', drink);
                    }
                }
                //send message along
                return { 'message': message, 'context': cleanContext(context) };
            }
            if(context.random){
              console.log('Random beer');
              return randomBeer().then(mkBeerMessage);
            }
            console.log('Searcing beer', input, mkBeerMessage);
            return searchBeer(input)
            .then(mkBeerMessage)
            .catch((error)=>{
              logger.error(`Failed to get beer ${error}`);
            });
        }
    }
    else if (context.hasOwnProperty('random')) {
        return combinedSearch({}).then( function(drink) {
            //replace {0} in message with drinks
            message = message.replace(/\{.*\}/, drink.name);
            message += '. ';
            if (drink.description) {
                message += 'Here\'s how it\'s made: ' + drink.description + '.';
            }

            //send message along
            return { 'message': message, 'context': cleanContext(context) };
        })
    }
    return Promise.resolve({ 'message': message, 'context': cleanContext(context) });
}

export {enrichMessage};
