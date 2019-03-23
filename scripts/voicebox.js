//var slate = require('slate-react');


// given a text and an ngram size, returns a dictionary mapping ngrams of that size
// to the number of times they occurred
function countNgrams(input_text, n) {
	var words = input_text.split(' ');
	var lowerCaseWords = words.map(w => w.toLowerCase());
	var wordCounts = Object.create(null);	// object with no prototype and no inherited properties or methods
	
	for (i = 0; i < lowerCaseWords.length-n+1; i++) {
		var start = i;
		var end = i+n;
		var ngram = lowerCaseWords.slice(start, end).join(' ');

	    // if this ngram is not already a property of the wordCounts object, create it with the value of 1
	    if (!wordCounts[ngram]) {
	        wordCounts[ngram] = 1;
	    } else {
	    // if this ngram IS already a property of wordCounts, then increase its count value
	        wordCounts[ngram]++;
	    }
	}
	return wordCounts;

}

// updates model by adding entries from a dictionary d that maps ngrams to scores
function addScoredNgrams(d, model) {
	Object.keys(d).forEach(function(k) {
		var v = d[k];
		addNgram(k, v, model);
	});

}

// helper function to above. adds a single space-separated string (i.e., an ngram) to the model,
// treating the last word of the ngram as the continuation, and the rest of it as the context.
// if the ngram is only one word (i.e., a 1-gram), then the context is an empty string
function addNgram(ngram, value, model) {
	console.log('ngram is', ngram)
	var words = ngram.split(' ');
	var head = words.slice(0, words.length - 1).join(' ');
	var tail = words[words.length - 1];

	if (!model[head]) {
		model[head] = {};
		model[head][tail] = value;
	} else {
		if (!model[head][tail]) {
			model[head][tail] = value;
		} else {
			model[head][tail] += value;
		}
	}

}


// normalizes overall model
function normalizeModel(m) {
	for (var key in m) {
		normalize(m[key]);
	}
}

// helper that normalizes a single dictionary
function normalize(d) {
	var total = sum(d);
	for (var key in d) {
	  if (d.hasOwnProperty(key)) {
	    d[key] = d[key]/total;
	  }
	}
}

// helper that sums all values in a dictionary
function sum(obj) {
  var sum = 0;
  for (var el in obj) {
    if( obj.hasOwnProperty( el ) ) {
      sum += parseFloat( obj[el] );
    }
  }
  return sum;
}

// build a model of a single ngram size
function ngramModel(text, ngramSize) {
	var counts = countNgrams(text, ngramSize);
	var model = Object.create(null);
	addScoredNgrams(counts, model);
	normalizeModel(model);
	return model;

}

// build ngram models with increasing context size, starting at 0 (empty string)
function buildModels(text, maxNgramSize) {

	var models = [];
	for (var i=0; i<maxNgramSize; i++) {
		var ngramSize = i+1;
		var model = ngramModel(text, ngramSize);
		models.push(model);
	}

	return models;

}

// given a context (any number of space-separated words) and associated weights,
// finds a list of words that could follow from that context
function suggest(history, models, weights) {
	var words = history.split(' ');

	var modelContinuations = [];
	var contexts = [];

	// find continuations from contexts of increasing size, starting at 0 (empty string)
	for (var i = 0; i < models.length; i++) {
		var model = models[i];
		var context = words.slice(words.length - i, words.length).join(' ');
		if (context in model) {
			modelContinuations.push(model[context]);
		} else {
			modelContinuations.push({})
		}
	}

	var aggregateSuggestions = {};

	for (var i = 0; i < models.length; i++) {
		continuations = modelContinuations[i];
		weight = weights[i];
		for (var key in continuations) {
			if (continuations.hasOwnProperty(key)) {
				weightedScore = continuations[key] * weight;
				if (key in aggregateSuggestions) {
					aggregateSuggestions[key] += weightedScore;
				} else {
					aggregateSuggestions[key] = weightedScore;
				}
			}
		}
	}

	return aggregateSuggestions;

}


// returns n model weights increasing by powers of x
function powersOf(x, n) {
	weights = [];
	for (var i = 0; i < n; i++) {
		weights.push(x ** i);
	}
	return weights
}


var input = 'Because the night belongs to lovers because the night belongs to lust';

models = buildModels(input, 3);
weights = powersOf(10, 3);

console.log(models);
console.log(weights);

ss = suggest('because the night', models, weights);
console.log(ss);
