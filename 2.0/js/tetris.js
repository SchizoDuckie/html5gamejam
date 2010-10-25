/**
 *	Tetris
 *
 */

$(window).addEvent('domready', function() {


	var arrowKeys = new Tetris.Keyboard({ 
		map:{ 
			65: Tetris.ROTATE_LEFT,
			103 : Tetris.ROTATE_LEFT,
			36: Tetris.ROTATE_LEFT,
			33: Tetris.ROTATE_RIGHT,
			38: Tetris.ROTATE_RIGHT,
			104: Tetris.ROTATE_RIGHT,
			83: Tetris.ROTATE_RIGHT,
			37: Tetris.MOVE_LEFT, 
			100: Tetris.MOVE_LEFT, 
			39: Tetris.MOVE_RIGHT,
			102: Tetris.MOVE_RIGHT,
			40: Tetris.MOVE_DOWN,
			98: Tetris.MOVE_DOWN,
			12: Tetris.DROP,
			101: Tetris.DROP,
			32: Tetris.DROP
		}
	});


	var player1 = new Tetris({
		target: $('tetris'),
		renderer: Tetris.CanvasRenderer,
		controller: arrowKeys,
		cols: 10,
		rows: 20,
		width: 200,
		height: 400
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

		// separate SRS kicks from state a to b as int. 0 is spawnstate, 1 right, 2 upside down, 3 left.
		kicks: {
			'0-1' : [[-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
			'2-1' : [[-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
			'1-0' : [[ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
			'1-2' : [[ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
			'2-3' : [[ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
			'0-3' : [[ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
			'3-2' : [[-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
			'3-0' : [[-1, 0], [-1, 1], [ 0,-2], [-1,-2]]
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
			this.shape = this.queue.shift();
			this.queue.push(this.factory.getShape());
			
			var x = _floor(this.model.width / 2);
			this.shape.moveTo(x, 1);

			if(!this.model.fits(this.shape)) {
				this.stop();
			}
		},

		reset: function() {
			this.setModel(new Tetris.Model(this.options));
			
			this.queue = [];
			for(var i=0; i<5; i++) {
				this.queue.push(this.factory.getShape());
			}

			this.start();
		},

		start: function() {
			this.newShape();
			this.timer = setInterval(this.heartbeat.bind(this), 1000);
		},

		stop: function() {
			clearInterval(this.timer);
			if(confirm('again?!')) this.reset();
		},

		remove: function() {
			
		},

		handleCommand: function(type) {
			switch (type) {
				case Tetris.MOVE_LEFT:		this.moveShape(-1, 0);	break;
				case Tetris.MOVE_RIGHT:		this.moveShape(1, 0);	break;
				case Tetris.MOVE_DOWN:		this.moveShape(0, 1);	break;
				case Tetris.ROTATE_LEFT:	this.rotateShape(-1);	break;
				case Tetris.ROTATE_RIGHT:	this.rotateShape(1);	break;				
				case Tetris.DROP:			this.dropShape();		break;
			}
			this.update();
		},

		moveShape: function(x, y) {
			var shape = this.shape;
			if(this.model.fits(shape.movedBy(x, y))) {
				shape.moveBy(x, y);
			}
		},

		rotateShape: function(dir) {
			var model = this.model;
			var shape = this.shape;
			var rotated = shape.rotatedBy(dir);


			if(model.fits(rotated)) {
				shape.rotateBy(dir);
			} else {
				var type = shape.state + '-' + rotated.state;
				var kicks = this.kicks[type];

				var l = kicks? kicks.length : 0;
				for(var kicked,k,x,y,i=0; i<l; i++) {
					k = kicks[i];
					x = k[0];
					y = k[1];

					kicked = rotated.movedBy(x, y);
					if(model.fits(kicked)) {
						shape.rotateBy(dir);
						shape.moveBy(x, y);
						break;
					}
				}
			}
		},

		dropShape: function() {
			var shape = this.shape;
			while(this.model.fits(shape.movedBy(0,1))) {
				shape.moveBy(0,1);
			}
		},

		heartbeat: function() {
			var model = this.model;
			var shape = this.shape;
			
			if(model.fits(shape.movedBy(0,1))) {
	                       shape.moveBy(0, 1);
			} else {
				model.put(shape);
				this.newShape();
				this.fireEvent('drop', {model: model.data, shapePoints: shape.getPoints(), shapeData: shape.getData()}); 
			}
			this.update();
		},

		update: function() {
			var model = this.model;
			var shape = this.shape;
			var ghost;

			ghost = shape.clone();
			while(model.fits(ghost.movedBy(0,1))) {
				ghost.moveBy(0,1);
			}
			this.renderer.draw(model, shape, ghost, this.queue);
		}
	});


	Tetris.ROTATE_LEFT = 1;
	Tetris.ROTATE_RIGHT = 2;
	Tetris.MOVE_LEFT  = 3;
	Tetris.MOVE_RIGHT = 4
	Tetris.MOVE_DOWN  = 5;
	Tetris.DROP = 6;



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
			
			$(document).addEvent('keydown',  this.handleKeyup.bind(this));
		},

		handleKeyup: function(e) {
			if(e.target.tagName.toLowerCase() != 'input') {
				var command = this.options.map[e.code];
				if(command) {
					this.game.handleCommand(command);
						e.stop();
				}
			}
		}
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
			//console.log(e);
		}
	});


	/**
	 * Touch controller
	 * 
	 */

	Tetris.Touch = new Class({
		Implements: [Events, Options],

		initialize: function(options) {
			this.setOptions(options);
		},

		setGame: function(game) {
			this.game = game;
			var target = game.getContainer();
			target.addEventListener('touchstart', this);
			target.addEventListener('touchmove', this);
			target.addEventListener('touchend', this);
		},

		handleEvent: function(e) {
			//console.log(e)
		}
	});


	/**
	 * Remote controller
	 * 
	 */

	Tetris.Remote = new Class({
		Implements: [Events, Options],

		initialize: function(options) {
			this.setOptions(options);
		},

		setGame: function(game) {
			this.game = game;
			this.game.stop = function() {
				
			}	
			this.game.renderer.drawShape = this.drawShape.bind(game.renderer);
			this.game.renderer.draw = this.draw.bind(game.renderer);
			game.stop();
			game.heartbeat = function() {};
			this.game.addEvent('newData', this.drawRemote.bind(this));
		},
		
		drawRemote: function(data) {
			this.game.shape.points = data.shapePoints;
			this.game.shape.data = data.shapeData;
			this.game.model.data = RLE.decode(data.model);
			this.game.renderer.draw(this.game.model, this.game.shape, this.game.shape);

		},
		
		draw: function(model, shape) {
			this.model = model;
			this.spriteWidth = this.canvas.width / model.width;
			this.spriteHeight = this.canvas.height / model.height;
			this.drawModel(model);
		},


		
		drawShape: function(shape) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var c = this.model.width;
			var ctx = this.context;

			var points = shape.getPoints();
			var data = shape.getData();
			var sprite = this.getSprite(data);
			
			var l = points.length;
			for(var p,i=0; i<l; i++) {
				p = points[i];				
				x = (p[0] % c) * sw || Math.floor(c /2) * sw;
				y = p[1] * sh || sh ;
				ctx.drawImage(sprite, x, y, sw, sh);					
			}
		}
	});


	/**
	 * Shape factory
	 * 
	 */

	Tetris.ShapeFactory = new Class({
		Implements: [Events, Options],

		shapes: [
			[[-2,0], [-1,0],[0,0], [1,0]],	// I
			[[-1,-1],[-1,0],[0,0], [1,0]],	// J
			[[-1,0], [0,0], [1,0], [1,-1]],	// L
			[[-1,-1],[-1,0],[0,-1],[0,0]],	// O
			[[-1,0], [0,0], [0,-1],[1,-1]],	// S
			[[-1,0], [0,-1],[0,0], [1,0]],	// T
			[[-1,-1],[0,-1],[0,0], [1,0]]	// Z
		],
		
		queue: [],
		renderers: [],
			
		initialize: function(options) {
			this.setOptions(options);
			this.getShapes(5);
			
			this.queueDiv= options.target.appendChild(
				document.createElement('div')
			);
			this.queueDiv.innerHTML ='<h2>Queue:</h2>';
			this.queueDiv.className = 'shapequeue';

			this.model = new Tetris.Model({cols: 4, rows: 3});
			this.renderers = [
				new Tetris.CanvasRenderer({ target:this.queueDiv, width: 50, height:50, cols: 3, rows: 4 }),
				new Tetris.CanvasRenderer({ target:this.queueDiv, width: 50, height:50, cols: 3, rows: 4 }),
				new Tetris.CanvasRenderer({ target:this.queueDiv, width: 50, height:50, cols: 3, rows: 4 })
					];
		},

		getShapes: function(n) {
			for(i=0;i<n;i++) {
				this.queue.push(this.newShape());
			}
		},

		newShape: function(n) {
			var l = this.shapes.length;
			var r = n || _floor(_random() * l);
			return new Tetris.Shape(this.shapes[r], r + 1);
		},

		showPreview: function() {
			for(i=0;i<this.renderers.length; i++) {
				this.renderers[i].draw(this.model, this.queue[1+i].moveTo(2,2));
			}
			return(this.queue[1]);
		},


		getShape: function(n) {
			this.getShapes(1);
			this.showPreview();
			return this.queue.shift();

		}
	});


	/**
	 * Shape
	 * 
	 */

	Tetris.Shape = new Class({
		Implements: [Events],

		initialize: function(points, data, position, state) {
			this.points = points;
			this.rotation = new Matrix();
			this.state = state || 0;
			this.position = position || new Matrix();
			this.data = data;
			this.angle = PI / -2;
		},

		moveTo: function(x, y) {
			this.position = new Matrix();
			this.position = this.position.translate(x, y);
			return this;
		},

		moveBy: function(x, y) {
			this.position = this.position.translate(x, y);
			return this;
		},

		rotateBy: function(dir) {
			this.state = (4 + this.state + dir) % 4;
			var rotation = this.rotation.rotate(this.angle * dir);
			this.points = this.transform(rotation);
			return this;
		},

		movedBy:function(x, y) {
			return this.clone().moveBy(x, y);
		},

		rotatedBy: function(dir) {
			return this.clone().rotateBy(dir);
		},

		getPoints: function() {
			return this.transform(this.position);
		},

		getData: function() {
			return this.data;
		},

		clone: function() {
			return new Tetris.Shape(this.points, this.data, this.position, this.state);
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
			for(i=0; i<this.total;i++) { this.data[i] = 0; }
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
			if(!this.newLine) {
				this.newLine =[];
				for(i=0;i<w;i++){ this.newLine[i]=0; } 
			}

			for(var i=min; i<max; i++) {
				if(!this.data[i]) {
					i = (i + w) - (i % w) -1;
					continue;
				}

				if((i + 1) % w == 0) {
					var at = i - w + 1;
					this.data.splice(at, w);
					this.data.unshift.apply(this.data, this.newLine);
				}
			}

		},

		fits: function(shape) {
			var points = shape.getPoints();
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

		draw: function(model, shape, ghost, queue) {
			this.model = model;
			this.spriteWidth = this.canvas.width / model.width;
			this.spriteHeight = this.canvas.height / model.height;

			this.drawModel(model);
			if(ghost)this.drawGhost(ghost);
			this.drawShape(shape);
			this.drawQueue(queue);
		},


		drawModel: function(model) {
			var canvas = this.canvas;
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var c = model.width;

			var ctx = this.context;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			var l = model.total;
			for(var x, y, d, sprite, i=0; i<l; i++) {
				x = (i % c) * sw;
				y = _floor(i / c) * sh;
				d = model.data[i];
				
				sprite = this.getSprite(d);
				if(sprite) {
					ctx.drawImage(sprite, x, y, sw, sh);
				}
			}
		},

		drawShape: function(shape) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var c = this.model.width;
			var ctx = this.context;

			var points = shape.getPoints();
			var data = shape.getData();
			var sprite = this.getSprite(data);
			
			var l = points.length;
			for(var p,i=0; i<l; i++) {
				p = points[i];				
				x = (p[0] % c) * sw;
				y = p[1] * sh;
				ctx.drawImage(sprite, x, y, sw, sh);
			}
		},

		drawGhost: function(ghost) {
			var ctx = this.context;
			ctx.save();
			ctx.globalAlpha = 0.15;
			this.drawShape(ghost);
			ctx.restore();
		},

		drawQueue: function(queue) {
			var next = queue[0];
			// todo
		},

		resizeTo: function(w, h) {
			var canvas = this.canvas;
			canvas.width = w;
			canvas.height = h;
			this.context = canvas.getContext('2d');
		}
	});


	/**
	 * DivRenderer
	 * 
	 */

	Tetris.DivRenderer = new Class({
		Implements: [Events, Options],

		chars: [
			'trans',
			'a',
			'b',
			'c',
			'd',
			'e',
			'f',
			'g',
		],

		grid:[],

		initialize: function(options) {
			this.setOptions(options);
			this.node = new Element('div').addClass('divRenderer').inject(options.target);
			options.target.appendChild(this.node);
			this.resizeTo(options.width, options.height);
		},

		getContainer: function() {
			return this.node;
		},

		getChar: function(data) {
			return this.chars[data];
		},

		drawGrid: function(length, width) {
			this.grid = new Array(length);
			for(var i=0; i<length; i++) {
				this.grid[i] = new Element('div').addClass('trans').inject(this.node);
				if((i + 1) % width == 0) {
					new Element('div').addClass("lineclear").inject(this.node)
				}
			}

		},

		draw: function(model, shape, ghost) {		
			if(this.grid.length != model.total) this.drawGrid(model.total, model.width);
				
			var shape = this.drawShape(shape,model);
			var ghost = this.drawShape(ghost,model);
		
			for(var i=0; i< model.total; i++) {
				this.grid[i].set('class', (ghost[i] && !shape[i] ? 'ghost ' : '') + this.getChar(shape[i] || ghost[i] || model.data[i] || 0));
				//if(ghost[i]) this.grid[i].addClass('ghost');
				
			}
		},

		drawShape: function(shape, model) {
			var insert = [];
			var c = model.width;
			var points = shape.getPoints();
			var data = shape.getData();

			var l = points.length;
			for(var p,i=0; i<l; i++) {
				p = points[i];
				var at = p[0] + (p[1] * c);
				insert[at] = data;
			}	
			return insert;
		},

			resizeTo:function(w, h) {
			this.node.setStyles({width: w, height: h});
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
			'<span class="a">▓</span>',
			'<span class="b">▒</span>',
			'<span class="c">☻</span>',
			'<span class="d">█</span>',
			'<span class="e">☺</span>',
			'<span class="f">#</span>',
			'<span class="g">░</span>',
		],				

		initialize: function(options) {
			this.setOptions(options);
			this.node = document.createElement('pre'); 
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
					out[i] += "<br>";
				}
			}

			this.node.innerHTML = out.join('');
		},

		resizeTo:function(w, h) {
			var css = this.node.style;
			css.width = w + 'px';
			/*css.height = h + 'px';*/
			css.fontSize = '9px';
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
	};

	return Tetris;

})();