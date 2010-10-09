/**
 * touch stuff
 * 
 */

var Touch = new Class({
	Implements: [Options],

	initialize: function(options) {
		this.setOptions(options);
		this.setCanvas(options.canvas);
		this.fingers = [];
	},

	setCanvas:function(canvas) {
		canvas.addEventListener('touchstart', this, false);
		canvas.addEventListener('touchmove', this, false);
		canvas.addEventListener('touchend', this, false);
		
		
	},	

	handleEvent: function(e) {
		e.preventDefault();

		var changed = e.changedTouches;
		var touches = e.touches;
		
		var amount = touches? touches.length : 0;
		
		var finger;
		var event;

		for(var i=0; i<amount; i++) {
			finger = this.fingers[i];
			var event = touches[i];
					
			switch (e.type) {
				case 'touchstart':
				case 'mousedown':
					event = changed[0];
					if(!finger) {
						this.fingers[i] = new Finger(event.clientX, event.clientY);
					}
				break;
				case 'touchmove':
				case 'mousemove':
					event = touches[i];
					if(finger) {
						finger.addPoint(event.clientX, event.clientY);
					}
				break;
				case 'touchend':
				case 'mouseup':
					if(finger) {
						// finger.addPoint(event.clientX, event.clientY);
						finger.performAction();
						this.fingers.splice(i, 1, false);
					}
				break;
			}
		}

	},

	getFingers: function() {
		return this.fingers;
	}


});

var Finger = new Class({
	Implements: [Events],

	initialize: function(x, y) {
		this.points = [{x:x, y:y}];
	},

	addPoint:function(x,y) {
		this.points.push(
			{x:x, y:y}	
		)
	},

	getPoints:function() {
		return this.points;
	},

	performAction: function() {
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

		$(document).fireEvent('schwipe', { origin: a, dir: dir });
		
	}
});