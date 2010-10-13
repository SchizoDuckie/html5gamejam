/**
 *	Tetris
 *
 */

$(window).addEvent('domready', function() {


	var arrowKeys = new Tetris.Keyboard({ 
		map:{ 37: 'left', 38: 'rotate', 39: 'right', 40: 'drop' }
	});

	var wasdKeys = new Tetris.Keyboard({ 
		map:{ 65: 'left', 87: 'rotate', 68: 'right', 83: 'drop' }
	});

	var mouse = new Tetris.Mouse();

	var player1 = new Tetris({
		target: document.body,
		renderer: Tetris.CanvasRenderer,
		controller: arrowKeys,
		cols: 11,
		rows: 15,
		width: 220,
		height: 300
	});


	var player2 = new Tetris({
		target: document.body,
		renderer: Tetris.CanvasRenderer,
		controller: wasdKeys,
		cols: 11,
		rows: 15,
		width: 220,
		height: 300
	});


});


/**
 * Tetris
 * 
 */

var Tetris = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);
		this.model = new Tetris.Model(options);
		
		var Renderer = options.renderer;
		this.renderer = new Renderer(options);

		this.factory = new Tetris.ShapeFactory(options);

		this.controller = options.controller;
		this.controller.setGame(this);
		
		this.start();
	},

	getContainer: function() {
		return this.renderer.getContainer();
	},

	resizeGame: function(w, h) {
		this.renderer.resizeTo(w, h);
	},

	resizeGrid: function(w, h) {
		this.model.resizeTo(w, h);
	},

	newShape: function() {
		this.shape = this.factory.getShape();
		var x = Math.floor(this.model.width / 2);
		this.shape.moveTo(x, 1);
	},

	start: function() {
		this.newShape();

		this.timer = setInterval(this.heartbeat.bind(this), 1000);
	},

	handleCommand: function(type) {
		switch (type) {
			case 'left':
				if(this.model.fits(this.shape.movedBy(-1,0))) {
					this.shape.moveBy(-1, 0);
				}
			break;
			case 'rotate':
				if(this.model.fits(this.shape.rotatedBy(1))) {
					this.shape.rotate(1);
				}
			break;
			case 'right':
				if(this.model.fits(this.shape.movedBy(1,0))) {
					this.shape.moveBy(1, 0);
				}
			break;
			case 'drop':
				while(this.model.fits(this.shape.movedBy(0,1))) {
					this.shape.moveBy(0,1);
				}
			break;
		}

		this.renderer.draw(this.model, this.shape);
	},

	

	heartbeat: function() {
		if(this.model.fits(this.shape.movedBy(0,1))) {
			this.shape.moveBy(0, 1);
		} else {
			this.model.put(this.shape);
			this.newShape();
		}

		this.renderer.draw(this.model, this.shape);
	}
});


/**
 * Keyboard controller
 * 
 */

Tetris.Keyboard = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);
	},

	setGame: function(game) {
		this.game = game;
		document.addEventListener('keyup', this.handleKeyup.bind(this), false);
	},

	handleKeyup: function(e) {
		var command = this.options.map[e.keyCode];
		if(command) {
			this.game.handleCommand(command);
		}
	},
});


/**
 * Mouse controller
 * 
 */

Tetris.Mouse = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);
	},

	setGame: function(game) {
		this.game = game;
		var target = game.getContainer();
		target.addEventListener('click', this.handleClick.bind(this), false);
	},

	handleClick: function(e) {
		console.log(e);
	}
});


/**
 * Touch controller
 * 
 */

Tetris.Touch = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOption(options);
	},

	setGame: function(game) {
		this.game = game;
		var target = game.getContainer();
		target.addEventListener('touchstart', this);
		target.addEventListener('touchmove', this);
		target.addEventListener('touchend', this);
	},

	handleEvent: function(e) {
		console.log(e)
	}
});


/**
 * Remote controller
 * 
 */

Tetris.Remote = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOption(options);
	},

	setGame: function(game) {
		this.game = game;
		
		// comet / socket / etc
	}
});


/**
 * Shape factory
 * 
 */

Tetris.ShapeFactory = new Class({
	Implements: [Events, Options],

	shapes: [
		[[-2,0], [-1,0],[0,0], [1,0]],
		[[-1,-1],[-1,0],[0,0], [1,0]],
		[[-1,0], [0,0], [1,0], [1,-1]],
		[[-1,-1],[-1,0],[0,-1],[0,0]],
		[[-1,0], [0,0], [0,-1],[1,-1]],
		[[-1,0], [0,-1],[0,0], [1,0]],
		[[-1,-1],[0,-1],[0,0], [1,0]]
	],

	colors: [
		'#00f0f0',
		'#0000f0',
		'#f0a000',
		'#f0f000',
		'#00f000',
		'#a000f0',
		'#f00000'
	],
		
	initialize: function(options) {
		this.setOptions(options);
	},

	getShape: function() {
		var l = this.shapes.length;
		var r = Math.floor(Math.random() * l);
		return new Tetris.Shape(this.shapes[r], this.colors[r]);
	}
});


/**
 * Shape
 * 
 */

Tetris.Shape = new Class({
	Implements: [Events],

	initialize: function(points, sprite) {
		this.points = points;
		this.rotation = new Matrix();
		this.position = new Matrix();
		this.sprite = sprite;
		this.angle = Math.PI / -2;
	},

	moveTo: function(x, y) {
		this.position = new Matrix();
		this.position = this.position.translate(x, y);
	},

	moveBy: function(x, y) {
		this.position = this.position.translate(x, y);
	},

	movedBy:function(x, y) {
		var position = this.position.translate(x, y);
		return this.transform(position);
	},

	rotate: function(dir) {
		var rotation = this.rotation.rotate(this.angle * dir);
		this.points = this.transform(rotation);
	},

	rotatedBy: function(dir) {
		var rotation = this.rotation.rotate(this.angle * dir);
		return this.transform(this.position.multiply(rotation.base));
	},

	getPoints: function() {
		return this.transform(this.position);
	},

	transform: function(matrix) {
		var l = this.points.length;
		var m = matrix.base;
		var result = [];

		for(var p,x,y,i=0; i<l; i++) {
			p = this.points[i];
			x = p[0];
			y = p[1];

			result[i] = [
				Math.round(m[0] * x + m[1] * y + m[2]),
				Math.round(m[3] * x + m[4] * y + m[5])	
			];
		}
		
		return result;
	}
});


/**
 * Model
 * 
 */

Tetris.Model = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);
		this.data = [];
		this.resizeTo(options.cols, options.rows);
	},

	resizeTo:function(w, h) {
		this.width = w;
		this.height = h;
		this.total = w * h;
		this.data.length = this.total;
	},

	put: function(shape) {
		var points = shape.getPoints();
		
		var min = this.total;
		var max = 0;

		var l = points.length;
		for(var x,y,d,p,i=0; i<l; i++) {
			p = points[i];
			x = p[0];
			y = p[1] * this.width;

			min = Math.min(min, y);
			max = Math.max(max, y + this.width);

			this.data[x + y] = shape.sprite;
		}

		return this.check(min, max);
	},

	check: function(min, max) {
		var w = this.width;
		for(var i=min; i<max; i++) {
			if(!this.data[i]) {
				i = (i + w) - i % w -1;
				continue;
			}

			if((i + 1) % w == 0) {
				var at = i - w + 1;
				this.data.splice(at, w);
				this.data.unshift.apply(this.data, new Array(w));
			}
		}

	},

	fits: function(points) {
		var l = points.length;
		var r = this.width - 1;
		for(var d,p,x,y,i=0; i<l; i++) {
			p = points[i];
			x = p[0];
			y = p[1];
			d = x + (y * this.width);
			if(x < 0 || x > r || d >= this.total || this.data[d]) {
				return false;
			}
		}
		return true;
	}
});


/**
 * Renderer(s)
 * 
 */

Tetris.CanvasRenderer = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);
		this.canvas = options.target.appendChild(
			document.createElement('canvas')
		);

		this.resizeTo(options.width, options.height);
	},

	// interface requirement, must return the root node of the particular renderer
	getContainer: function() {
		return this.canvas;
	},

	draw: function(model, shape) {
		var c = model.width;
		var r = model.height;
		var w = this.canvas.width;
		var h = this.canvas.height;

		var points = shape.getPoints();
		var insert = [];
		var l = points.length;
		for(var p,i=0; i<l; i++) {
			p = points[i];
			var at = p[0] + (p[1] * c);
			insert[at] = shape.sprite;
		}

		var l = c * r;
		var sw = w / c;
		var sh = h / r;

		var ctx = this.context;
		ctx.fillStyle = '#f0f0f0';

		for(var x, y, i=0; i<l; i++) {
			x = (i % c) * sw;
			y = Math.floor(i / c) * sh;

			ctx.fillStyle = insert[i] || model.data[i] || '#f0f0f0';
			ctx.fillRect(x, y, 19, 19);
		}
	},

	resizeTo: function(w, h) {
		var canvas = this.canvas;
		canvas.width = w;
		canvas.height = h;
		this.context = canvas.getContext('2d');
	}
});


/**
 * Matrix
 * 
 */

function Matrix(base) {
	this.base = base || [
		1, 0, 0,
		0, 1, 0
	];
}

Matrix.prototype = {
	_multiply: function(
			a1,a2,a3,
			a4,a5,a6, 
			
			b1,b2,b3,
			b4,b5,b6
	) {
		return new Matrix([
			a1 * b1 + a2 * b4,
			a1 * b2 + a2 * b5,
			a1 * b3 + a2 * b6 + a3,

			a4 * b1 + a5 * b4,
			a4 * b2 + a5 * b5,
			a4 * b3 + a5 * b6 + a6
		]);
	},

	multiply:function(b) {
		return this._multiply.apply(this, this.base.concat(b));
	},

	scale:function(sx, sy) {
		return this.multiply([
			sx, 0,  0,
			0,  sy, 0
		]);
	},

	translate:function(dx, dy) {
		return this.multiply([
			1, 0, dx,
			0, 1, dy
		]);
	},

	rotate:function(r) {
		var sin = Math.sin(r), cos = Math.cos(r);
		return this.multiply([
			 cos, sin, 0,
			-sin, cos, 0
		]);
	}
}

