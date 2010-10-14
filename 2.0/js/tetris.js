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
		renderer: Tetris.TextRenderer,
		controller: wasdKeys,
		cols: 11,
		rows: 15,
		width: 220,
		height: 300
	});


});

var Tetris = (function() {

	/**
	 * Performance
	 * 
	 */

	var _random = Math.random;
	var _round = Math.round;
	var _floor = Math.floor;
	var _min = Math.min;
	var _max = Math.max;
	var _sin = Math.sin;
	var _cos = Math.cos;
	var PI = Math.PI;


	/**
	 * Tetris
	 * 
	 */

	var Tetris = new Class({
		Implements: [Events, Options],

		initialize: function(options) {
			this.setOptions(options);
			
			var Renderer = options.renderer;
			this.renderer = new Renderer(options);

			this.factory = new Tetris.ShapeFactory(options);

			this.controller = options.controller;
			this.controller.setGame(this);
			
			this.reset();
		},

		getContainer: function() {
			return this.renderer.getContainer();
		},

		resizeGame: function(w, h) {
			this.renderer.resizeTo(w, h);
		},

		resizeModel: function(w, h) {
			this.model.resizeTo(w, h);
		},

		setModel: function(model) {
			this.model = model;
		},

		getModel: function() {
			return this.model;
		},

		newShape: function() {
			this.shape = this.factory.getShape();
			var x = _floor(this.model.width / 2);
			this.shape.moveTo(x, 1);

			if(!this.model.fits(this.shape.getPoints())) {
				this.stop();
			}
		},

		reset: function() {
			this.setModel(new Tetris.Model(this.options));		
			this.start();
		},

		start: function() {
			this.newShape();
			this.timer = setInterval(this.heartbeat.bind(this), 1000);
		},

		stop: function() {
			clearInterval(this.timer);
			if(confirm('game over, reset?')) {
				this.reset();
			}
		},

		remove: function() {
			
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
			document.addEventListener('keydown', this.handleKeyup.bind(this), false);
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
			
			// game.getModel()
			// game.setModel()
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
			
		initialize: function(options) {
			this.setOptions(options);
		},

		getShape: function() {
			var l = this.shapes.length;
			var r = _floor(_random() * l);
			return new Tetris.Shape(this.shapes[r], r + 1);
		}
	});


	/**
	 * Shape
	 * 
	 */

	Tetris.Shape = new Class({
		Implements: [Events],

		initialize: function(points, data) {
			this.points = points;
			this.rotation = new Matrix();
			this.position = new Matrix();
			this.data = data;
			this.angle = PI / -2;
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

		getData: function() {
			return this.data;
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
					_round(m[0] * x + m[1] * y + m[2]),
					_round(m[3] * x + m[4] * y + m[5])	
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
			var data = shape.getData();
			
			var min = this.total;
			var max = 0;

			var l = points.length;
			for(var x,y,d,p,i=0; i<l; i++) {
				p = points[i];
				x = p[0];
				y = p[1] * this.width;

				min = _min(min, y);
				max = _max(max, y + this.width);

				this.data[x + y] = data;
			}

			return this.check(min, max);
		},

		check: function(min, max) {
			var w = this.width;
			for(var i=min; i<max; i++) {
				if(!this.data[i]) {
					i = (i + w) - (i % w) -1;
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

		colors: [
			null,
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
			this.canvas = options.target.appendChild(
				document.createElement('canvas')
			);

			this.resizeTo(options.width, options.height);
			this.prerender();
		},

		// interface requirement, must return the root node of the particular renderer
		getContainer: function() {
			return this.canvas;
		},

		prerender: function() {
			this.sprites = [];
			var l = this.colors.length;
			var opt = this.options;

			var sw = opt.width / opt.cols;
			var sh = opt.height / opt.rows;
			
			var color, canvas, ctx;
			for(var i=0; i<l; i++) {
				color = this.colors[i];
				if(color) {
					canvas = document.createElement('canvas');
					canvas.width = sw;
					canvas.height = sh;
					
					ctx = canvas.getContext('2d');
					
					// color fill
					ctx.fillStyle = color;
					ctx.fillRect(0, 0, sw, sh);
					ctx.lineWidth = sw / 5;
					
					// light bevel
					ctx.globalAlpha = 0.75;
					ctx.beginPath();
					ctx.strokeStyle = '#ffffff';
					ctx.moveTo(0, sh);
					ctx.lineTo(0, 0);
					ctx.lineTo(sw, 0);
					ctx.stroke();
					
					// shaded bevel
					ctx.globalAlpha = 0.25;
					ctx.beginPath();
					ctx.strokeStyle = '#000000';
					ctx.moveTo(sw, 0);
					ctx.lineTo(sw, sh);
					ctx.lineTo(0, sh);
					ctx.stroke();
					
					this.sprites[i] = canvas;
				}
			}
		},

		getSprite: function(data) {
			return this.sprites[data];
		},

		draw: function(model, shape) {
			var c = model.width;
			var r = model.height;
			var w = this.canvas.width;
			var h = this.canvas.height;

			var points = shape.getPoints();
			var data = shape.getData();
			var insert = [];
			var l = points.length;
			for(var p,i=0; i<l; i++) {
				p = points[i];
				var at = p[0] + (p[1] * c);
				insert[at] = data;
			}

			var l = c * r;
			var sw = w / c;
			var sh = h / r;

			var ctx = this.context;
			ctx.clearRect(0, 0, w, h);
			ctx.shadowBlur = sw / 3;
			ctx.shadowColor = 'rgba(0,0,0,0.5)'
			
			for(var x, y, sprite, i=0; i<l; i++) {
				x = (i % c) * sw;
				y = _floor(i / c) * sh;

				sprite = this.getSprite(insert[i] || model.data[i] || 0);
				if(sprite) {
					ctx.drawImage(sprite, x, y, sw, sh);
				}
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
	 * TextRenderer
	 * 
	 */

	Tetris.TextRenderer = new Class({
		Implements: [Events, Options],

		chars: [
			'-',
			'<span class="a">A</span>',
			'<span class="b">B</span>',
			'<span class="c">C</span>',
			'<span class="d">D</span>',
			'<span class="e">E</span>',
			'<span class="f">F</span>',
			'<span class="g">G</span>',
		],

		initialize: function(options) {
			this.setOptions(options);
			this.node = document.createElement('div'); 
			this.node.className = 'textRenderer';
			options.target.appendChild(this.node);

			this.resizeTo(options.width, options.height);
		},

		getContainer: function() {
			return this.node;
		},

		getChar: function(data) {
			return this.chars[data];
		},

		draw: function(model, shape) {		
			var points = shape.getPoints();
			var data = shape.getData();
			var insert = [];
			
			var c = model.width;
			
			var l = points.length;
			for(var p,i=0; i<l; i++) {
				p = points[i];
				var at = p[0] + (p[1] * c);
				insert[at] = data;
			}

			var out = [];
			var l = model.total;
			for(var i=0; i<l; i++) {
				out[i] = this.getChar(insert[i] || model.data[i] || 0);
				if((i + 1) % c == 0) {
					out[i] += '\n';
				}
			}

			this.node.innerHTML = out.join('');
		},

		resizeTo:function(w, h) {
			var css = this.node.style;
			css.width = w + 'px';
			css.height = h + 'px';
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
			var sin = _sin(r), cos = _cos(r);
			return this.multiply([
				 cos, sin, 0,
				-sin, cos, 0
			]);
		}
	}


	return Tetris;

})();