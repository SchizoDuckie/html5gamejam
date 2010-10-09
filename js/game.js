/**
 * Individual Games
 * 
 */

Game = new Class({
	initialize: function(options) {

		this.sprite = new Sprite({
			source: 'images/sprite.png',
			width: 30,
			height: 30
		});

		this.data = new GameData();

		this.activeShape = new TetrisShape({
			type: 3
		});

	},

	heartbeat: function() {
		this.activeShape.moveBy(0,1)
		this.activeShape.rotate(1);
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
