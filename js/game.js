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
		this.data.setHeight(17);
		this.getNewShape();
		this.gameOver = false;
	},

	heartbeat: function() {
		if(this.gameOver) return;
		var points = this.activeShape.transform(this.activeShape.rotation);	

		if(this.data.canMove(points, this.activeShape.x, this.activeShape.y -1))
		{	
			this.activeShape.moveBy(0,-1);	
		} 
		else {
			if(this.activeShape.y == this.data.getHeight()) {
				this.gameOver = true;
			}
			this.data.placeShape(points, this.activeShape.getType(), this.activeShape.x, this.activeShape.y);
			this.fireEvent('shapeplaced', this.activeShape);
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
				data.canMove(points, shape.x -1, shape.y) && shape.moveBy(0, -1);

			break;
		}
	},
	
	getNewShape: function() {
		this.activeShape = new TetrisShape();
		this.activeShape.moveTo(7,this.data.getHeight());
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
