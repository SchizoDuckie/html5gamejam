/**
 * Individual Games
 * 
 */

Game = new Class({
	Implements: [Events, Options],

	initialize: function(options) {
		this.setOptions(options);

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

	performAction: function(type) {
		switch (type) {
			case 'left':
				this.activeShape.moveBy(-1, 0);
			break;
			case 'right':
				this.activeShape.moveBy(1, 0);
			break;
			case 'drop':
				this.activeShape.moveBy(-1, 0);
			break;
			case 'rotate':
				this.activeShape.rotate(1);
			break;
		}
	},

	heartbeat: function() {
		this.activeShape.moveBy(0, -1);
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
