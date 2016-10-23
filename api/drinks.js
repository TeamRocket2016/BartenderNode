import rp from 'request-promise';
// --------------------------------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------------------------------

function checkType( type ) {
	const possible = ['ordinary drink', 'cocktail', 'soft drink \/ soda', 'milk \/ float \/ shake', 'other\/unknown', 'cocoa','shot', 'coffee \/ tea', 'homemade liqueur', 'punch \/ party drink', 'beer']

	if (possible.indexOf(type.toLowerCase()) > -1) { return true; }
	return false;
}

// --------------------------------------------------------------------------
// COCKTAIL DB FUNCTIONS
// --------------------------------------------------------------------------

/* Drink objects returned have the following qualities:
	idDrink
	strDrink (drink name)
	strCategory
		Ordinary Drink
		Cocktail
		Soft Drink / Soda
		Milk / Float / Shake
		Other / Unknown
		Cocoa
		Shot
		Coffee / Tea
		Homemade Liqueur
		Punch / Party Drink
		Beer
	strAlcoholic
	strGlass (the type of glass it comes in)
	strInstructions
	strDrinkThumb (image)
	strIngredient1 ... strIngredient15
	strMeasure1 ... strMeasure15
	dateModified
*/

// return a promise for a random drink
function randomDrink() {
	return rp( {
		url: 'http://www.thecocktaildb.com/api/json/v1/1/random.php',
		json: true
	}).then(function (res) {
		return res.drinks[0];
	}, function (err) {
		return err;
	});
}

// returns a promise that will resolve as the drink search results
// check resolved result for null array (no results)
function searchByName( name ){
	return rp( {
		url: 'http://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + name,
		json: true
	}).then(function (res) {
		return res.drinks;
	}, function(err) {
		return err;
	});
}

// returns a promise for a list of drinks containing the given ingredient
// check resolved result for null array
function searchByIngredient( ingr ) {
	return rp( {
		url: 'http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=' + ingr,
		json: true
	}).then(function (res) {
		return res.drinks;
	}, function (err) {
		return err;
	});
}

// returns a promise for a list of drinks of the given type
// if type does not match one of the necessary types, returns
// Promise object that will resolve to false
function searchByType ( type ) {
	if (checkType(type)) {
		// this is a valid type
		return rp( {
			url: 'http://www.thecocktaildb.com/api/json/v1/1/filter.php?c=' + type,
			json: true
		}).then(function (res) {
			return res.drinks;
		}, function (err) {
			return err;
		});
	} else {
		return Promise.resolve(false);
	}
}

// search for multiple parameters at once
// pass in params as object with values
// 		i: ingr (should be array)
//		c: type
//		a: alcoholic (pass in as boolean)
function multiSearch ( params ) {
	var url = 'http://www.thecocktaildb.com/api/json/v1/1/filter.php?';
	if (params.hasOwnProperty('i')) {
		for (var param in params['i']) {
			url = url + 'i=' + param + '&';
		}
	}
	if (params.hasOwnProperty('c')) {
		if (checkType(params['c'])) {
			url = url + 'c=' + params['c'] + '&';
		} else {
			console.log("Multisearch given incorrect type (" + params['c'] + "), skipping in search");
		}
	}
	if (params.hasOwnProperty('a')) {
		if (params['a']) {
			url = url + 'a=' + 'Alcoholic' + '&';
		} else {
			url = url + 'a=' + 'Non_Alcoholic' + '&';
		}
	}
	console.log("Created search term " + url + " from multisearch");

	return rp( {
		url: url,
		json: true
	}).then(function (res) {
		return res.drinks;
	}, function (err) {
		return err;
	})
}

// --------------------------------------------------------------------------
// RANDOM DRINK TEST
// --------------------------------------------------------------------------
function testRandom() {
	randomDrink().then( function(res) {
		console.log(res);
	}, function(err) {
		console.log("Error resolving randDrink()");
	});
}

// --------------------------------------------------------------------------
// SEARCH BY NAME TESTS
// --------------------------------------------------------------------------
function testName() {
	// test Search By Name with reasonable search term
	searchByName('margarita').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'margarita': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByName()");
	});

	// test Search by Name with nonsense term
	searchByName('asldkasdf').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'asldkasdf': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByName()");
	});
}

// --------------------------------------------------------------------------
// SEARCH BY INGREDIENT TESTS
// --------------------------------------------------------------------------
function testIngr() {
	// test searchByIngredient with reasonable term
	searchByIngredient('gin').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'gin': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByIngredient()");
	});

	// test searchByIngredient with nonsense term
	searchByIngredient('asldfjas').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'asldfjas': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByIngredient()");
	});
}

function testType() {
// --------------------------------------------------------------------------
// SEARCH BY TYPE TESTS
// --------------------------------------------------------------------------
	// test searchByType with reasonable term
	searchByType('shot').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'shot': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByType()");
	});

	// test searchByType with nonsense term
	searchByType('asldfjas').then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search 'asldfjas': No results");
		}
	}, function(err) {
		console.log("Error resolving searchByType()");
	});
}

function testMulti() {
// --------------------------------------------------------------------------
// MULTISEARCH TESTS
// --------------------------------------------------------------------------
	// several different sets of params
	const params1 = {
		'i': ['Gin'],
		'a': true,
		'c': 'shot'
	}
	const params2 = {
		'c': 'asdlkfsad',
		'a': false
	}
	const params3 = {
		'i': ['Whiskey', 'Ice']
	}
	multiSearch(params1).then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search params1: No results");
		}
	}, function(err) {
		console.log("Error resolving multiSearch()");
	});

	multiSearch(params2).then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search params2: No results");
		}
	}, function(err) {
		console.log("Error resolving multiSearch()");
	});

	multiSearch(params3).then( function(res) {
		if (res) {
			console.log(res[0]);
		} else {
			console.log("Search params3: No results");
		}
	}, function(err) {
		console.log("Error resolving multiSearch()");
	});
}


// call all the tests
testRandom();
testName();
testIngr();
testType();
testMulti();
