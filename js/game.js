/**
 * Individual Games
 * 
 */

Game = new Class({
	Implements: [Options],

	initialize: function(options) {
		this.setOptions(options);

		this.sprite = new Sprite({
			source: 'images/sprite.png',
			width: 30,
			height: 30
		});

		this.data = new GameData();
		this.getNewShape();
		this.gameOver = false;
	},

	heartbeat: function(direction) {
		if(this.gameOver) return;
		var direction = direction  || 0 
		if(this.data.canMove(this.activeShape, direction, -1))
		{
			this.activeShape.moveBy(direction,-1);	
		}
		else {
			if(this.activeShape.y == 17) this.gameOver= true;	
			//this.activeShape.moveBy(direction,-1);	
			this.data.placeShape(this.activeShape);
			this.getNewShape();
		}
	},

	performAction: function(type) {
		var shape = this.activeShape;
		switch (type) {
			case 'left':

				shape.moveBy(-1, 0);
			break;
			case 'right':
				shape.moveBy(1, 0);
			break;
			case 'rotate':
				shape.rotate(1);
			break;
			case 'drop':
				shape.drop();
			break;
		}
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
