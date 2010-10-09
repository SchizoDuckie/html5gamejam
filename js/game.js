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

	},

	heartbeat: function() {
		if(this.data.gameOver()) return;
		if(this.data.canMove(this.activeShape, 0, -1))
		{
			this.activeShape.moveBy(0,-1);	
			
		} else {
			this.data.placeShape(this.activeShape, 0, -1);
			this.getNewShape()
		}
	},
	
	getNewShape: function() {
		console.debug('creating new TetrisShape');
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
