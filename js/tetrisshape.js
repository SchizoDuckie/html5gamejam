TetrisShape = new Class({
	Implements: [Options],

	shapeData: [
		{ 
			shape: [ [-1,-1], [0,-1],[-1,0], [0,0] ],
			probability: 1,
			mirrorable: false	
		},
	    { 
			shape: [ [-1,-2], [-1, -1], [-1,0], [0,0]  ], 
			probability: 0.8,
			mirrorable: true
		},
	    { 
			shape: [ [0,-2], [0, -1], [0,0], [0,1] ],  
			probability: 1,
			mirrorable: false
		},
		{ 
			shape: [ [-1,0], [0,0], [0, -1], [1,-1] ],
			probability: 1,
			mirrorable: true
		},
		{
			shape: [ [0,-1], [-1,0], [0,0], [1,0]  ],
			probability: 1,
			mirrorable: false

		}
	],
	rotatedPoints: false,

	// choose a new block
	// based on probability 
	// rotate it random, mirror it random if mirrorable.
	initialize: function(options) {
		this.setOptions(options);
		
		// randomize

		var randomNumber = Math.floor(Math.random() * this.shapeData.length		);
		console.debug('Picked random: ', randomNumber);
		this.options.type = randomNumber;
		this.points = this.shapeData[randomNumber].shape;
		this.rotation = new Matrix();
		this.angle = Math.PI / 2;
		
		this.moveTo(4,17);
		this.getPoints();
		
		
	},

	// rotates the dataset for this shape
	rotate: function(direction) {
			this.rotation.rotate(this.angle * direction);
	},

	// mirror the dataset for this shape
	mirror: function() {
		var scaler = new Matrix();
		scaler.scale(-1, 0);

		this.points = this.transform(scaler);
	},

	moveTo: function(x, y) {
		this.x = x;
		this.y = y;
	},

	moveBy: function(x, y) {
		this.x += x;
		this.y += y;
	},

	transform: function(matrix) {
		var p = this.points;
		var l = p.length;
		var result = [];

		var m = matrix.base;
		var m00 = m[0][0],
			m01 = m[0][1],
			m02 = m[0][2],
			m10 = m[1][0],
			m11 = m[1][1],
			m12 = m[1][2];

		for(var point,x,y,i=0; i<l; i++) {
			point = p[i];
			x = point[0];
			y = point[1];

			result[i] = [
				Math.round(m00 * x + m01 * y + m02),
				Math.round(m10 * x + m11 * y + m12)	
			];
		}

		return result;
	},

	getType: function() {
		return this.options.type;
	},
	
	// return the currently active shapeData in the currently rotated way
	getPoints: function() {
		var x = this.x;
		var y = this.y;
			var points = this.transform(this.rotation);
			var l = points.length;
			var result = [];
			for(var p,i=0; i<l; i++) {
				p = points[i];
				result.push([
					p[0] + x,
					p[1] + y
				]);
			}
		return result;
	}
});
