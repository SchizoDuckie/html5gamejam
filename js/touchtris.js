/**
 * controller
 * 
 */

TouchTris = new Class({
	Implements: [Events],

	initialize: function() {
		this.games = [];
		
		var player1 = new Game({
			width: 480,
			height: 510,
			orientation: 'top'
		});

		var player2 = new Game({
			width: 480,
			height: 510,
			orientation: 'bottom'
		});

		this.addGame(player1);
		this.addGame(player2);

		var canvas = document.getElementById("game");

		this.renderer = new Renderer({
			canvas: canvas
		});

		this.touch = new Touch({
			canvas: canvas
		});

		$(document).addEvent('schwipe', this.handleSwipe.bind(this));

		this.start();
	},

	// handle a swipe gesture by any one or more fingers
	handleSwipe: function(e) {
		var dir = e.dir;
		var origin = e.origin;

		console.log(origin)
	
		var i = (origin.y < 512)? 0 : 1;
		var game = this.games[i];
		var action;
		
		switch (dir) {
			case 1:
				action = i? 'drop' : 'rotate';
			break;
			case 2:
				action = i? 'right' : 'left';
			break;
			case 3:
				action = i? 'rotate' : 'drop';
			break;
			case 4:
				action = i? 'left' : 'right';
			break;
		}

		game.performAction(action);
	},

	addGame: function(game) {
		this.games.push(game);
	},

	start: function() {
		this.stop();
		this.timer = setInterval(this.tick.bind(this), 1000);
	},

	stop: function() {
		clearInterval(this.timer);
	},

	tick: function() {
		var l = this.games.length;
		for(var i=0; i<l; i++) {
			this.games[i].heartbeat();
		}

		for(var i=0; i<l; i++) {
			this.renderer.render(this.games[i]);
		}

		var fingers = this.touch.getFingers();
		this.renderer.renderFingers(fingers);
	}

});


/**
 * game
 * 
 */




$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});