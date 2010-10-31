/**
 *	Tetris
 *
 */

var Tetris = (function() {
	
	var _random = Math.random;
	var _round = Math.round;
	var _floor = Math.floor;
	var _ceil = Math.ceil;
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
		lastCmd: false,
		paused: false,
		initialize: function(options) {
			this.setOptions(options);
		
			var Renderer = options.renderer;
			this.renderer = new Renderer(options);

			this.factory = new Tetris.ShapeFactory(options);

			this.powerups = options.powerups;
			this.controller = options.controller;
			this.controller.setGame(this);

			var Scoring = options.scoring || Tetris.Scoring;
			this.scoring = new Scoring(this.options);
			this.scoring.setGame(this);

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
			if(this.gameover) {
				return;
			} else {
				this.shape = this.factory.nextShape();
				var x = _floor(this.model.width / 2);
				this.shape.moveTo(x, 1);

				if(!this.model.fits(this.shape)) {
					this.stop();
					this.fireEvent('gameover');
					return false;
					
				}
			}
			return true;
		},

		reset: function() {
			this.setModel(new Tetris.Model(this.options));	
			this.powers = [];
			this.gameover = false;
			this.factory.reset();
			this.scoring.reset();
			this.scoring.setGame(this);
			this.start();
		
		},

		start: function() {	
			this.newShape();
			this.heartbeat();
		},

		pause: function() {
			if(!this.paused) {
				clearTimeout(this.timer);
				this.paused = true;
			} else {
				this.paused = false;
				this.heartbeat();
			}
		},

		stop: function(dontReset) {
			this.gameover = true;
			clearTimeout(this.timer);
			this.timer = false;
			this.controller.stopGame();
		},

		remove: function() {
			
		},

		handleCommand: function(type) {
			override = false; /// for t-spin alert
			switch (type) {
				case Tetris.MOVE_LEFT:		this.moveShape(-1, 0);						break;
				case Tetris.MOVE_RIGHT:		this.moveShape(1, 0);						break;
				case Tetris.MOVE_DOWN:		if (this.moveShape(0, 1)) this.fireEvent('softDrop'); break;
				case Tetris.ROTATE_LEFT:	override = this.rotateShape(-1);			break;
				case Tetris.ROTATE_RIGHT:	override = this.rotateShape(1);				break;				
				case Tetris.DROP:			this.fireEvent('drop', this.dropShape());	break;
				case Tetris.PAUSE:			this.pause();								break;
				case Tetris.POWERUP:		this.usePowerup(this);						break;
				case Tetris.DELETE:			this.deletePowerup();						break;
				case Tetris.HOLD_SHAPE:		this.holdShape();							break;
			}
			if(!override) this.scoring.lastCommand = type;	
			this.update();
		},

		moveShape: function(x, y) {
			var shape = this.shape;
			if(this.model.fits(shape.movedBy(x, y))) {
				shape.moveBy(x, y);
				return true;
			}
			return false;
		},

		rotateShape: function(dir) {
			var model = this.model;
			var shape = this.shape;
			var rotated = shape.rotatedBy(dir);
			if(model.fits(rotated)) {
				shape.rotateBy(dir);
				if(shape.initState == '-1,00,-10,01,0' && model.detectTspin(shape)) {
					this.scoring.lastCommand = Tetris.T_SPIN; // zoiets.
					dbg("T-spin detected!, set last command ", this.scoring.lastCommand);
					return true;
				}	
			} else {
				var type = shape.state + '-' + rotated.state;
				var kicks = this.kicks[type];
//				dbg(kicks, type, this.kicks);
				var l = kicks? kicks.length : 0;
				for(var kicked,k,x,y,i=0; i<l; i++) {
					k = kicks[i];
					x = k[0];
					y = k[1];
					
					kicked = rotated.movedBy(x, y);
					if(model.fits(kicked)) {
					//	dbg("Would fit, kicked", kicked);
						shape.rotateBy(dir);
						shape.moveBy(x, y);
						if(shape.initState == '-1,00,-10,01,0' && model.detectTspin(shape)) {
							this.scoring.lastCommand = Tetris.T_SPIN_KICKED;
							return true;
						}
						break;
					}
				}
			}
			return false;
		},

		dropShape: function() {
			var shape = this.shape;
			dropped=0;
			while(this.model.fits(shape.movedBy(0,1))) {
				shape.moveBy(0,1);
				dropped++;
			}
			return {dropped:dropped};
		},

		holdShape: function() {
			var shape = this.shape;
			var held = this.heldShape;
			this.heldShape = shape;				
		//	this.heldShape.position = new Matrix();
			if(held) {
				this.shape = held;
			//	this.shape.position = shape.position;
			} else {
				this.newShape();
			}

			this.renderer.drawHold(this.heldShape);
		},

		heartbeat: function() { 
			var model = this.model;
			var shape = this.shape;

			if(this.checkQueued) {
				this.checkQueued = false;
				var cleared = model.check(0, model.total);
				if(cleared.length) {
					this.handlePowerups(cleared);
				}
				// fire event? 
			}
			
			if(model.fits(shape.movedBy(0,1))) {
				shape.moveBy(0, 1);
			} else {
				var cleared = model.put(shape);
				if(cleared.length) {
					this.handlePowerups(cleared);
				}				
				this.fireEvent('heartbeat', {model: model.data, shapePoints: shape.getPoints(), shapeData: shape.getData(), score: this.scoring.getScore()}); 
				this.newShape();

			}
			if(!this.gameover) {
				this.timer = setTimeout(this.heartbeat.bind(this), 1000 - (this.scoring.getLevel() * 50));
			} 
			this.update();		
		},

		handlePowerups:function(cleared) {
			var powers = this.powerups.getPowerups(cleared);
			l = powers.length;
			for(var i=0; i<l; i++) {
				this.powers.push(powers[i]);
			}

			l = cleared.length;
			var powers = l / this.model.width;
			for(var i=0; i<powers; i++) {
				this.powerups.addPowerup(this.model);
			}
		},

		usePowerup: function(target) {
			var player = target || this;
			var power = this.powers.shift();
			if(power) {
				var model = player.getModel();
				var data = this.powerups.run(power, model);
				model.setData(data);
				player.setModel(model);
				player.queueCheck();
			}
		},

		deletePowerup: function() {
			this.powers.shift();
		},
			
		queueCheck: function() {
			this.checkQueued = true;
		},

		update: function() {
			var model = this.model;
			var shape = this.shape;
			var queue = this.factory.getQueue();
			var powers = this.powers;
			var ghost;

			ghost = shape.clone(this.state);
			while(model.fits(ghost.movedBy(0,1))) {
				ghost.moveBy(0,1);
			}

			this.renderer.draw(model, shape, ghost, queue, powers);
		}
	});

	Tetris.Scoring = new Class({
		Implements: [Options, Events],
		level: 1,
		score: 0,
		lines: 0,
		lastCommand: 0,

		rules: {
			32: [0, 100, 300, 500, 800, 1000], // Normal line removed.
			64: [0, 100, 300, 500, 800, 1000, 1500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],  // cascade combo, increasing 50 per line.
			128 : [0, 100, 800, 1200, 1600, 1800, 2500, 4000, 6500, 8000, 10000, 12000, 14000, 16000, 18000, 20000],	   // Tetris.T_SPIN  100 points for just placing it even if no lines are removed.
			256 : [0, 100, 300, 500, 800, 1000, 1500, 2000, 3000, 3500, 4000, 4500, 5000, 5500, 6000]		   // Tetris.T_SPIN_KICKED
		},

		initialize: function(options) {

			this.setOptions(options);
			this.container = $(options.target).getFirst('.details');
			this.draw();
		},

		setGame:function(game) {
			if(game.model) { 
				game.model.addEvents({
					'linesCleared': this.linesCleared.bind(this)
				});
				game.addEvents({
					'drop':		this.drop.bind(this),
					'softDrop': this.softDrop.bind(this)
				});
			}
		},

		reset: function() {
			this.score =  this.lines = this.lastCommand = 0;
			this.level = 1;
			this.draw();
		},

		getLevel: function() {
			return this.level;
		},

		getScore: function() {
			return { level: this.level, score:this.score, lines: this.lines};
		}, 

		setScore: function(s) {
			this.level = s.level;
			this.score = s.score;
			this.lines = s.lines;
			this.draw();
		},

		linesCleared: function(lines){
			var points = 0, lc = this.lastCommand;
			this.lines += lines.removed;
			//dbg("Lines removed, last command was: ", lc, Tetris.T_SPIN);
			if(lc == Tetris.T_SPIN || lc == Tetris.T_SPIN_KICKED) {
				points = this.level * this.rules[lc][lines.removed]; 
				alert("T-Spin baby!, you removed " +lines.removed+" lines and got "+points+" points!");
				this.fireEvent('tSpin', {points: points, lines:lines});	
			} else {
				points = this.level * (this.rules[32][lines.removed] || this.rules[64][lines.removed]) ;		
			}
			this.score += points;
			if(this.lines % 10 == 0) this.level++;
			this.draw();
		},

		// needs to be called after consecutive soft drops.
		softDrop: function() {
			dbg('softdrop', this.lastCommand);
			if(this.lastCommand= Tetris.MOVE_DOWN) {
				this.score++;
				this.draw();
			}
		},

		// full drop rewards 2 points per dropped line
		drop: function(lines) {
			dbg('drop: ', lines);
			this.score += 2 * lines.dropped;
			this.draw();
		},
		

		draw: function() {
			if(!this._s) this._s = this.container.getFirst('.score');
			if(!this._l) this._l = this.container.getFirst('.lines');
			if(!this._lv) this._lv = this.container.getFirst('.level')
			this._l.set('html', this.lines);
			this._lv.set('html', this.level);
			this._s.set('html', this.score);
		}
	});

	Tetris.Scoring.Remote = new Class({
		Extends: Tetris.Scoring,
		Implements: [Options, Events],
		initialize: function(options) {
			this.username = '';
			this.setOptions(options);
			this.container = $(options.target).getFirst('h2').empty();
			this.draw();
		},

		getScore: function() {
			return { level: this.level, score:this.score, lines: this.lines};
		}, 

		setGame: function() {},

		setScore: function(s, username) {
			this.level = s.level;
			this.score = s.score;
			this.lines = s.lines;
			this.username =  username;
			this.draw();
		},


		draw: function() {
			if(!this.marquee) {
				this.marquee = new Element('marquee').injectInside(this.container);
			}
			this.marquee.set('html', this.username+'- Level: '+this.level+' Score: ' + this.score,' Lines: '+this.lines);
		}

	})


	Tetris.ROTATE_LEFT = 1;
	Tetris.ROTATE_RIGHT = 2;
	Tetris.MOVE_LEFT  = 3;
	Tetris.MOVE_RIGHT = 4
	Tetris.MOVE_DOWN  = 5;
	Tetris.DROP = 6;
	Tetris.LINE_REMOVED = 7;
	Tetris.POWERUP = 10;
	Tetris.DELETE = 11;
	Tetris.HOLD_SHAPE = 12;
	Tetris.PAUSE = 8;
	Tetris.T_SPIN = 128;
	Tetris.T_SPIN_KICKED = 256;



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
			$(document).addEvent('keydown',  this._ = this.handleKeyup.bind(this));
		},
		
		stopGame: function(game) {
			//$(document).removeEvent('keydown',  this._);
			//dbg('keyboard hook detached');
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

		stopGame: function(game) {
			$(document).removeEventListener('click',  this._);
		},

		setGame: function(game) {
			this.game = game;
			var target = game.getContainer();
			target.addEventListener('click', this._ = this.handleKeyup.bind(this), false);
		},

		handleClick: function(e) {
			//dbg(e);
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
			this._ = this.handleEvent.bind(this);
			target.addEventListener('touchstart', this._);
			target.addEventListener('touchmove', this._);
			target.addEventListener('touchend', this._);
		},

		stopGame: function(game) {
			var target = this.game.getContainer();
			target.removeEventListener('touchstart', this._);
			target.removeEventListener('touchmove', this._);
			target.removeEventListener('touchend', this._);
		},

		handleEvent: function(e) {
			//dbg(e)
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

		setUserName: function(username) {
			this.username = username;
		},

		setGame: function(game) {
			this.game = game;
			this.game.stop = function() { }	
			this.game.renderer.drawShape = this.drawShape.bind(game.renderer);
			this.game.renderer.draw = this.draw.bind(game.renderer);
			this.game.factory.showPreview = function() {};
		
			game.stop();
			game.heartbeat = function() {};
			this.game.addEvent('newData', this.drawRemote.bind(this));
		},
		
		stopGame: function() {

		},


		drawRemote: function(data) {
			if(!this.game.shape) this.game.shape = {};
			this.game.shape.points = data.shapePoints;
			this.game.shape.data = data.shapeData;
			this.game.model.data = RLE.decode(data.model);
			if(data.score) this.game.scoring.setScore(data.score, data.username);
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
			[[-1,0], [0,0], [1,0], [2,0]],	// I
			[[-1,-1],[-1,0],[0,0], [1,0]],	// J
			[[-1,0], [0,0], [1,0], [1,-1]],	// L
			[[-1,-1],[-1,0],[0,-1],[0,0]],	// O
			[[-1,0], [0,0], [0,-1],[1,-1]],	// S
			[[-1,0], [0,-1],[0,0], [1,0]],	// T
			[[-1,-1],[0,-1],[0,0], [1,0]]	// Z
		],
			
		initialize: function(options) {
			this.setOptions(options);
			this.reset();
		},

		reset: function() {
			this.queue = [];
			var l = this.options.queue;
			for(var i=0; i<l; i++) {
				this.queue.push(this.getShape());
			}
		},

		getQueue: function() {
			return this.queue;
		},

		getShape: function(n) {
			var l = this.shapes.length;
			var r = n || _floor(_random() * l);
			return new Tetris.Shape(this.shapes[r], r + 1);
		},

		nextShape: function() {
			this.queue.push(this.getShape());
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
			this.initState= points.join(''); // for recognizing T-spin later on
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

		getData: function() {
			return this.data;
		},

		setData: function(data) {
			if(data.length === this.total) {
				this.data = data;	
			} else {
				throw Error('Data size differs from current size');
			}
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
			var cleared = [];

			if(!this.newLine) {
				this.newLine = [];
				for(i=0; i<w; i++){ 
					this.newLine[i] = 0; 
				} 
			}

			for(var i=min; i<max; i++) {
				if(!this.data[i]) {
					i = (i + w) - (i % w) -1;
					continue;
				}

				if((i + 1) % w == 0) {
					var at = i - w + 1;
					cleared = cleared.concat(this.data.splice(at, w));
					this.data.unshift.apply(this.data, this.newLine);
				}
			}
			if(cleared.length > 0) {
				this.fireEvent('linesCleared', { removed: cleared.length / this.width, lines:cleared});
			}
			return cleared;

		},


		recursiveDrop: function() {
			var row = 0;
			var done = false;
			var w = this.width;
			var d = this.data;
			while (!done)
			{
				done = true;
				for(var i = this.total; i> -1; i -= w) {
					for(var j=i; j > i - w; j--) {
						if(d[j] == 0 && d[j - w] > 0) {
							d[j] = d[j-w];
							d[j-w] = 0;
							done = false;
						}
					}
					row++;
				}
			}
			this.check(0, this.total);
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
		},

		detectTspin: function(shape) {
			//dbg("Detecting T-Spin!");
			var points = shape.getPoints();
			var l = points.length;
			var width = this.width - 1;
			var touchedsides =0;
				
			for(var d,p,x,y,i=0; i<l; i++) {
				p = points[i];
				x = p[0];
				y = p[1];
				var sides = [
					x - 1 +	(y * this.width), 
					x +	1 + (y * this.width),
					x + (y - 1 * this.width),
					x + (y + 1 *  this.width)
				];
				for(j=0; j<sides.length;j++) {
					touchedsides +=  this.data[sides[j]] && this.data[sides[j]] > 0 ? 1 : 0;
				}
				//dbg("Detecting t-spin for point "+x+','+y+' ' , touchedsides);
				if(x < 0 || x > width || d >= this.total || touchedsides >=3) {
					return true;
				}
			}
			return false;
		}

	});



	/**
	 * Powerups
	 * 
	 */

	Tetris.Powerups = {
		types: {},
		data: [],

		register: function(type, filter) {
			this.types[type] = filter;
			this.data.push(type);
			this.powerreg = new RegExp('[' + this.data.join('') + ']','mg');
		},

		random: function() {
			var l = this.data.length;
			var i = _floor(_random() * l);
			return this.data[i];
		},

		getPowerups: function(data) {
			var powers = [];
			var s = data.join('');
			s.replace(this.powerreg, function(p) {
				powers.push(p);
			});
			return powers;
		},

		addPowerup: function(model) {
			var power = this.random();
			var data = model.getData();
			var indices = [];
			var l = data.length;
			for(var i=0; i<l; i++) {
				if(data[i]) {
					indices.push(i);
				}	
			}

			var random = _floor(_random() * indices.length);
			var index = indices[random];
			if(index) {
				data[index] = power;
			}
		},

		run: function(type, model) {
			var filter = this.types[type];
			if(filter) {
				return filter(model);
			}

			return data;
		}
	};

	// addline
	Tetris.Powerups.register('a', function(model) {
		var data = model.data;
		var w = model.width;
		var insert = [];
		var not = _floor(_random() * w);

		for(var i=0; i<w; i++) {
			insert[i] = (i == not)? 0 : 1 + _floor(_random() * 6);
		}

		data.push.apply(data, insert);
		data.splice(0, w);
		return data;
	});

	// clear line
	Tetris.Powerups.register('c', function(model) {
		var data = model.data;
		var w = model.width;
		var i = model.total - w;
		var out = data.splice(i, w);
		for(var i=0; i<w; i++) {
			out[i] = 0;
		}
		data.unshift.apply(data, out);
		return data;
	});

	// nuke
	Tetris.Powerups.register('n', function(model) {
		var data = model.data;
		var l = model.total;
		for(var i=0; i<l; i++) {
			data[i] = 0;
		}
		return data;
	});

	// remove
	Tetris.Powerups.register('r', function(model) {
		var data = model.data;
		var l = model.total
		var indices = [];
		for(var i=0; i<l; i++) {
			if(data[i]) {
				indices.push(i);
			}
		}
		
		l = indices.length;
		for(var i=0; i<5; i++) {
			var at = _floor(_random() * l);
			data[indices[at]] = 0;
		}
		return data;
	});

	// do switch with another player ...		
	Tetris.Powerups.register('s', function(model) {
		var data = model.data;
		return data
	});

	// basic
	Tetris.Powerups.register('b', function(model) {
		var data = model.data;
		var l = model.total;
		var b = 1+ _floor(_random() * 6);
		for(var i=0; i<l; i++) {
			var n = data[i];
			if(n && isNaN(n)) {
				data[i] = b;
			}
		}
		return data
	});

	// gravity
	Tetris.Powerups.register('g', function(model) {
		var data = model.data;
		var w = model.width;
		var h = model.height;

		var cols = [];
		for(var i=w-1; i>=0; i--) {
			cols[i] = [];
			for(var d,n,j=h-1; j>=0; j--) {
				d = (j * w) + i;
				n = data[d];
				if(n) {
					cols[i].push(n);
				}
				data[d] = 0;
			}
		}

		for(var i=0; i<w; i++) {
			var col = cols[i];
			var l = col.length;
			for(var d,j=0; j<l; j++) {
				d = (w * (h - j - 1)) + i;
				data[d] = col[j];
			}
		}

		return data;
	});

	// quake
	Tetris.Powerups.register('q', function(model) {
		var data = model.data;
		var l = model.total;
		data.unshift(0,0,0,0,0);
		data.length = l;
		return data;
	});

	// bomb
	Tetris.Powerups.register('o', function(model) {
		var data = model.data;
		var l = model.total;

		var a = [-11,-10, -9, -1, 1,9,10,11];
		var b = [-13,-20,-17,-11,11,7,20,23];

		for(var i=0; i<l; i++) {
			if(data[i] == 'o') {
				data[i] = 1;
				for(var j=0; j<8; j++) {
					var f = _max(0, _min(l-1, i + a[j]));
					var t = _max(0, _min(l-1, i + b[j]));
					data[t] = data[f];
					data[f] = 0;
				}
			}
		}

		return data;
	});



	/**
	 * Renderer(s)
	 * 
	 */
	Tetris.CanvasRenderer = new Class({
		Implements: [Events, Options],

		initialize: function(options) {
			this.setOptions(options);

			var target = options.target;
			this.canvas = new Element('canvas');
			target.getFirst('.game').set('html','').appendChild(this.canvas);

			var powers = target.getFirst('.powerups');
			if(powers) {
				this.powerups = new Element('canvas');
				powers.set('html','').appendChild(this.powerups);
			}

			var queue = target.getFirst('.details .next');
			if(queue) {
				this.queue = new Element('canvas');
				queue.set('html', '').appendChild(this.queue);
			}

			var hold = target.getFirst('.details .hold');
			if(hold) {
				this.holdbox = new Element('canvas');
				hold.set('html', '').appendChild(this.holdbox);
			}

			this.resizeTo(options.width, options.height);

			this.sprite = new Image();
			this.sprite.onload = this.prerender.bind(this);
			this.sprite.src = './sprite.png';
		},

		// interface requirement, must return the root node of the particular renderer
		getContainer: function() {
			return this.canvas;
		},

		prerender: function() {
			this.sprites = [];

			var shapes = [1,2,3,4,5,6,7]
			var powers = 'acnrsgbqo'.split('');

			this.renderSprites(shapes, -100, 0);
			this.renderSprites(powers, 0, 0);
		},

		renderSprites: function(data, dx, dy) {
			var l = data.length;
			var x = dx;
			var y = dy;
			for(var i=0; i<l; i++) {
				var canvas = document.createElement('canvas');
				canvas.width = 25;
				canvas.height = 25;
				var ctx = canvas.getContext('2d');
				ctx.drawImage(this.sprite, x, y);
				y -= 25;
				this.sprites[data[i]] = canvas;
			}
		},

		getSprite: function(data) {
			if(!this.sprites) this.prerender();
			return this.sprites[data];
		},

		draw: function(model, shape, ghost, queue, powers) {
			this.model = model;
			
			this.drawModel(model);
			this.drawShape(shape);
			this.drawQueue(queue);

			ghost && this.drawGhost(ghost);
			powers && this.powerups && this.drawPowers(powers);
		},


		drawModel: function(model) {
			var canvas = this.canvas;
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var c = model.width;

			var ctx = this.context;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			ctx.shadowOffsetX = 3;
			ctx.shadowOffsetY = 3;
			ctx.shadowBlur = 3;
			ctx.shadowColor = 'rgba(0,0,0,0.25)';
			var l = model.total;
			for(var x, y, d, sprite, i=0; i<l; i++) {
				x = (i % c) * sw;
				y = _floor(i / c) * sh;
				d = model.data[i];
				if(d) {
					sprite = this.getSprite(d);
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

		drawPowers: function(powers) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			
			this.pctx.clearRect(0,0, this.options.width, sh);

			var x = 0;
			var l = powers.length;
			for(var i=0; i<l; i++) {
				var sprite = this.getSprite(powers[i]);
				this.pctx.drawImage(sprite, x, 0, sw, sh);
				x += sw;
			}
		},

		drawQueue: function(queue) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var x = 1;
			var y = 1;

			this.qctx.clearRect(0,0, this.queue.width, this.queue.height);

			var l = queue.length;
			for(var i=0; i<l; i++) {
				var shape = queue[i];
				var points = shape.getPoints();
				var data = shape.getData();
				var sprite = this.getSprite(data);
			
				var k = points.length;
				for(var j=0; j<k; j++) {
					var p = points[j];
					this.qctx.drawImage(sprite, (x + p[0])*sw, (y + p[1])*sh, sw, sh);
				}

				y += 3;
			}
		},

		
		drawHold: function(shape) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;

			this.hctx.clearRect(0,0, this.holdbox.width, this.holdbox.height);

			var points = shape.getPoints();
			var data = shape.getData();
			var sprite = this.getSprite(data);
		
			var l = points.length;
			for(var i=0; i<l; i++) {
				var p = points[i];
				this.hctx.drawImage(sprite, p[0]*sw, (1+p[1])*sh, sw, sh);
			}
		},

		resizeTo: function(w, h) {
			var canvas = this.canvas;
			canvas.width = w;
			canvas.height = h;
			this.context = canvas.getContext('2d');

			this.spriteWidth = w / this.options.cols;
			this.spriteHeight = h / this.options.rows;

			
			if(this.powerups) {
				var powers = this.powerups;
				powers.width = w;
				powers.height = this.spriteHeight;
				this.pctx = powers.getContext('2d');
			}

			if(this.queue) {
				var que = this.queue;
				que.width = this.spriteWidth * 4;
				que.height = this.spriteHeight * 9;
				this.qctx = que.getContext('2d');
			}

			if(this.holdbox) {
				var hold = this.holdbox;
				hold.width = this.spriteWidth * 4;
				hold.height = this.spriteHeight * 4;
				this.hctx = hold.getContext('2d');
			}
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


function dbg() {
	if(window.console && console.log) console.log(arguments);
}
