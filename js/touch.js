/**
 * touch stuff
 * 
 */

var Touch = new Class({
	Implements: [Options],

	initialize: function(options) {
		this.setOptions(options);
		this.setCanvas(options.canvas);
		
		this.player1 = new Finger();
		this.player2 = new Finger();
	},

	setCanvas:function(canvas) {
		canvas.addEventListener('touchstart', this, false);
		canvas.addEventListener('touchmove', this, false);
		canvas.addEventListener('touchend', this, false);
	
		if(!/ipad/i.test(navigator.userAgent)) {
			canvas.addEventListener('mousedown', this, false);
			canvas.addEventListener('mousemove', this, false);
			canvas.addEventListener('mouseup', this, false);
		}
		
	},	

	handleEvent: function(e) {
		e.preventDefault();

		var changed = e.changedTouches || [e];
		var touches = e.touches || [e];
		var amount = Math.max(touches.length, changed.length);
		
		var event;

		for(var i=0; i<amount; i++) {
			var event = touches[i] || changed[i];
			var player = (event.pageY < 512)? this.player1 : this.player2;
					
			switch (e.type) {
				case 'touchstart':
				case 'mousedown':
					player.set(event.clientX, event.clientY);
				break;
				case 'touchmove':
				case 'mousemove':
					player.active && player.add(event.clientX, event.clientY);
				break;
				case 'touchend':
				case 'mouseup':
					player.active && player.act();
				break;
			}
		}

	},

	getFingers: function() {
		return [this.player1, this.player2];
	}


});

var Finger = new Class({
	Implements: [Events],

	initialize: function() {
		this.active = false;
		this.points = [];
	},

	set: function(x, y) {
		this.points = [{x:x, y:y}];
		this.active = true;
	},

	add:function(x,y) {
		this.points.push(
			{x:x, y:y}	
		)
	},

	getPoints:function() {
		return this.points;
	},

	act: function() {
		var a = this.points[0];
		var b = this.points[this.points.length -1];

		var dx = b.x - a.x;
		var dy = b.y - a.y;

		var dir;

		if(Math.abs(dx) > Math.abs(dy)) {
			dir = dx > 0 ? 2 : 4
		} else {
			dir = dy > 0 ? 3 : 1;
		}
		
		$(document).fireEvent('schwipe', { origin: a, direction: dir });
		this.points = [];
		this.active = false;
		
	}
});