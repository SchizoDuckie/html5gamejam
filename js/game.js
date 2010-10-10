/**
 * Individual Games
 * 
 */

Game = new Class({
	Implements: [Options, Events],

	initialize: function(options) {
		this.setOptions(options);

		this.sprite = new Sprite({
			source: 'images/sprite.png',
			width: 30,
			height: 30
		});

		this.pane = new Image();
		this.pane.src = options.pane;

		this.data = new GameData();
		this.data.addEvent('powerup', this.doPowerup.bind(this));
		this.getNewShape();
		this.gameOver = false;
	},

	heartbeat: function() {
		if(this.gameOver) return;
		var shape =  this.activeShape;
		var points = shape.transform(shape.rotation);	

		if(this.data.canMove(points, shape.x, shape.y -1))
		{	
			shape.moveBy(0,-1);	
		} 
		else {
			if(shape.y == this.data.getHeight()) {
				this.gameOver = true;
			}
			this.data.placeShape(points, shape);
			this.fireEvent('shapeplaced', shape);
			this.getNewShape()
		}
	},

	performAction: function(type) {
		var shape = this.activeShape;
		var data = this.data;
		var points = shape.transform(shape.rotation);

		switch (type) {
			case 'left':
				data.canMove(points, shape.x -1, shape.y) && shape.moveBy(-1, 0);
			break;
			case 'right':
				data.canMove(points, shape.x +1, shape.y) && shape.moveBy(1, 0);
			break;
			case 'up':
			case 'rotate':
				shape.rotate(1);
				if(!data.canMove(shape.transform(shape.rotation), shape.x, shape.y )) {
					shape.rotate(-1);
				}
			break;
			case 'down':
			case 'drop':
				shape.drop();
			break;
		}
	},

	doPowerup:function(e) {
		console.log(e);
	},
	
	getNewShape: function() {
		this.activeShape = new TetrisShape();
	},

	getOrientation: function() {
		return this.options.orientation;
	},

	getSprite: function() {
		return this.sprite;
	},

	getActiveShape: function() {
		return this.activeShape;
	},

	getData: function() {
		return this.data;

		
	}
})
