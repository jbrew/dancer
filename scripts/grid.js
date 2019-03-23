
let height = 400;
let width = window.innerWidth;


function setup() {
	createCanvas(width, 400);
	background(0);

	sprite = new Sprite(100,100);
	
};


function draw() {
	
	background(0);
	sprite.run();

};


let Sprite = function(position) {
	this.acceleration = createVector(0, 0);
	this.velocity = createVector(0,0);
	this.position = createVector(100, 100);
	//this.lifespan = 255;
};


Sprite.prototype.run = function() {
	this.update();
	this.checkEdges();
	this.display();
};

Sprite.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
};


Sprite.prototype.display = function() {
	var red_val = 150
	var blue_val = 150
	var green_val = 200

  	stroke(red_val,blue_val,green_val);
  	strokeWeight(4);

  	ellipse(this.position.x, this.position.y, 20, 20);
};


Sprite.prototype.checkEdges = function() {
	if (this.position.x < this.xmin) {
		this.velocity.x = this.velocity.x *= -1;
		this.position.x = this.xmin;
	} else if (this.position.x > this.xmax) {
		this.velocity.x = this.velocity.x *= -1;
		this.position.x = this.xmax;
	} else if (this.position.y < this.ymin) {
		this.velocity.y = this.velocity.y *= -1;
		this.position.y = this.ymin;
	} else if (this.position.y > this.ymax) {
		this.velocity.y = this.velocity.y *= -1;
		this.position.y = this.ymax;
	}
}

