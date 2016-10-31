import logger from './logging';
import {randomDrink, randomBeer, searchByIngredient, combinedSearch} from './drinks';

function IntentAndMessage(intent, message){
    this.intent = intent;
    this.message = message;
}

function enrichMessage(intent, message, context) {
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
                
                //clean up context
                delete context.search;
                delete context.ingredient;

                //send message along
                return { 'message': message, 'context': context };
            });
        } else if (context.hasOwnProperty('beer')) {
            return randomBeer().then (function(drink) {
                //replace {0} in message with drinks
                message = message.replace(/\{.*\}/, drink.name);
                message += '. ';
                if (drink.description) {
                    message += drink.description + '.';
                }

                //send message along
                return { 'message': message, 'context': context };
            })
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
            return { 'message': message, 'context': context };
        })
    }
    return Promise.resolve({ 'message': message, 'context': context });
}

export {enrichMessage};
