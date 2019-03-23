let tower;
let column;
let colors = ['red','orange']
let wordList = ['word','hack','todd','baby','castles','hello'];
let wordLog = document.getElementById("textBox");
let height = 400;
let width = window.innerWidth;

import initMidi from './midi.js';
//import enableKeyboardKeys from '.midi.js';

function randomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}


function getNextWordList(text) {
	return

}


function setup() {
	createCanvas(window.innerWidth, 400);
	background(0)

	tower = new CursorTower(width/3-10, width/3+10, 400);
	initMidi([tower]);

	column = new OptionColumn(wordList, createVector(width, height), 1.5);

	textAlign(CENTER, CENTER);
}


function draw() {
	background(0);

 	if (mouseIsPressed) {
 		column = new OptionColumn(wordList, createVector(width, height),1.5);
 		stroke(randomColor());
		noFill();
		strokeWeight(5);
    	ellipse(mouseX, mouseY, 10, 10);
  	}


  	//block.run();
  	tower.run();
  	column.run();
  	
}

window.setup = setup;
window.draw = draw;

let OptionColumn = function(wordList, position, speed=1) {
	this.origin = position.copy();

	this.wordblocks = [];
	this.rowHeight = this.origin.y / wordList.length;

	let currentPos = createVector(this.origin.x, this.origin.y - this.rowHeight);
	
	//currentPos.y -= this.rowHeight;

	var block;
	
	for (let i = 0; i < wordList.length; i++) {
		var word = wordList[i];
		block = new WordBlock(createVector(currentPos.x, currentPos.y), 
							 createVector(100,this.rowHeight-2), word, speed);
		this.wordblocks.push(block);
		currentPos.y -= this.rowHeight;
	}

}

OptionColumn.prototype.run = function() {
	for (let i = this.wordblocks.length-1; i>=0; i--) {
		//debugger;
		let block = this.wordblocks[i];
		block.run();
		if (block.isDead()) {
			this.wordblocks.splice(i, 1);
		}
	}
}


let WordBlock = function(position, size, text, speed=1) {
	this.velocity = createVector(-1 * speed, 0);
	this.position = position.copy();
	this.top = position.y;
	this.bottom = position.y+size.y;
	this.size = size;
	this.text = text;
	this.active = false;
}

WordBlock.prototype.run = function() {
	this.checkSelected();
	this.update();
	this.display();
}

WordBlock.prototype.update = function() {
	this.position.add(this.velocity);
}

WordBlock.prototype.display = function() {
	strokeWeight(2);
	if (this.active) {
		stroke('white');
		noFill();
	} else {
		stroke('purple');
		noFill();
	}

	rect(this.position.x, this.position.y, this.size.x, this.size.y);

	//strokeWeight(1);
	noStroke();
	fill('white');
	strokeWeight(1);
	textSize(15);
	text(this.text, this.position.x, this.position.y, this.size.x, this.size.y);

}

WordBlock.prototype.isDead = function() {
	return this.position < 0;
}

WordBlock.prototype.checkSelected = function() {
	if (Math.abs(this.position.x - tower.rightSide) < 5) {
		if (this.top < tower.cursor.position.y && this.bottom > tower.cursor.position.y) {
			if (! this.active) {
				this.active = true;
				wordLog.value += this.text + " ";
			}
		}

	}
}


let CursorTower = function(leftSide, rightSide, height=0) {
	this.leftSide = leftSide;
	this.rightSide = rightSide;
	this.width = this.rightSide - this.leftSide;
	this.height = height;
	this.cursor = new Cursor(createVector(this.leftSide, this.height/2));
	
}

CursorTower.prototype.run = function() {
	this.display();
	this.cursor.run();
}

CursorTower.prototype.display = function () {
	stroke('blue');
	noFill();
	strokeWeight(1);
	rect(this.leftSide, 0, this.width, height-1);
}

function getVelocityChange(userInputNotes) {
	if (userInputNotes.length > 1) {
		let lastNote = userInputNotes[userInputNotes.length - 1];
		let secondLastNote = userInputNotes[userInputNotes.length-2];
		let timeDifference = lastNote.time - secondLastNote.time;

		if (secondLastNote.code >= 54 && lastNote.code >=54 && timeDifference < 1) {
			if (lastNote.code > secondLastNote.code) {
				return 1;
			} else if (lastNote.code < secondLastNote.code) {
				return -1;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	} else {
		return 0;
	}
}

CursorTower.prototype.updateState = function(userInputNotes) {
	let deltaV = getVelocityChange(userInputNotes);
    this.cursor.velocity.y += -0.5 * deltaV;
}

let Cursor = function(position) {
	this.acceleration = createVector(0, 0.02);
	this.velocity = createVector(0,random(-5,-2));
	this.position = position.copy();
	//this.lifespan = 255;
}

Cursor.prototype.run = function() {
	this.update();
	this.checkEdges();
	this.display();
}

Cursor.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
};


Cursor.prototype.display = function() {
	var red_val = 150 + this.position.y * 25
	var blue_val = 150 - this.velocity.y * 25
	var green_val = 200

  	stroke(red_val,blue_val,green_val);
  	strokeWeight(4);
  	line(this.position.x + 1, this.position.y, this.position.x + 20, this.position.y);
};

Cursor.prototype.checkEdges = function() {
	if (this.position.y >= height) {
		this.velocity.y *= -0.4;
		this.position.y = height;
	}
	if (this.position.y <= 0) {
		this.velocity.y *= -0.4;
		this.position.y = 0;
	}
}






// given a text and an ngram size, returns a dictionary mapping ngrams of that size
// to the number of times they occurred
function countNgrams(input_text, n) {
	var words = input_text.split(' ');
	var lowerCaseWords = words.map(w => w.toLowerCase());
	var wordCounts = Object.create(null);	// object with no prototype and no inherited properties or methods
	
	for (var i = 0; i < lowerCaseWords.length-n+1; i++) {
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

var models = buildModels(input, 3);
var weights = powersOf(10, 3);

