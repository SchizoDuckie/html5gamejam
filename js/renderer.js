var Renderer = new Class({
	Implements: [Options],

	initialize: function(options) {
		this.setOptions(options);
		this.setCanvas(options.canvas);
	},

	setCanvas: function(canvas) {
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = '#f8f8f8';
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#000000';
		this.setContext(ctx);
	},
	
	setContext: function(context) {
		this.context = context;
	},

	getContext: function() {
		return this.context;
	},

	render: function(game) {
		this.prerender(game);

		var data = game.getData();
		var sprite = game.getSprite();

		var w = data.getWidth();
		var h = data.getHeight();

		var x = 0;
		var y = 0;
		var s;
		
		// draw the static data
		for(var i=0; i<h; i++) {
			for(var j=0; j<w; j++) {
				
				var type = data.get(j, i);

				if(type > 0) {
					s = sprite.render(type);
					x = (j * s.width);
					y = (i * s.height);

					this.drawSprite(s, x, y);
				}
			}
		}

		// draw the active shape
		var shape = game.getActiveShape();
		var points = shape.getPoints();
		var l = points.length;

		s = sprite.render(shape.getType())

		for(var p,i=0; i<l; i++) {
			p = points[i];
			x = p[0] * s.width;
			y = p[1] * s.height;

			this.drawSprite(s, x, y);
		}

		this.postrender(game);
	},

	prerender: function(game) {
		
		var ctx = this.context;
		ctx.save();
		
		var type = game.getOrientation();

		switch (type) {
			case 'top':
				ctx.rotate(Math.PI);
				ctx.translate(-624, -512);				
			break;
			case 'bottom':
				ctx.translate(144, 512);
			break;
		}

		ctx.clearRect(0,0,480,512);
		ctx.fillRect(0,0,480,512);
	},

	postrender: function(game) {
		this.context.restore();
	},

	renderFingers: function(fingers) {
		var l = fingers.length;
		var finger;
		for(var i=0; i<l; i++) {
			finger = fingers[i];
			finger.active && this.renderFinger(finger);
		}
	},

	renderFinger: function(finger) {
		var points = finger.getPoints();
		var l = points.length;
		var ctx = this.context;
		var p = points[0];

		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		for(var i=1; i<l; i++) {
			p = points[i];
			ctx.lineTo(p.x, p.y);
		}
		
		//ctx.closePath(); //nah
		ctx.stroke();
	},

	drawSprite: function(s, x, y) {
		this.context.drawImage(s, x, y);
	}

});



var Sprite = new Class({
	Implements: [Options],

	initialize: function(options) {
		this.setOptions(options);
		this.image = new Image();
		this.image.src = options.source;
		
		var c = this.canvas = document.createElement('canvas');
		c.width = options.width;
		c.height = options.height;

		this.context = c.getContext('2d');
	},

	render: function(type) {
		if(this.image.complete) {
			var offset = - type * this.options.height;
			this.context.drawImage(this.image, 0, offset);
		}

		return this.canvas;
	}

});