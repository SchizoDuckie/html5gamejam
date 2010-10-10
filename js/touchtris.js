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
			orientation: 'top',
			pane: 'images/pane2.jpg'
		});

		var player2 = new Game({
			width: 480,
			height: 510,
			orientation: 'bottom',
			pane: 'images/pane1.jpg'
		});

		this.addGame(player1);
		this.addGame(player2);

		var canvas = document.getElementById("game");

		var renderer = this.renderer = new Renderer({
			canvas: canvas
		});

		this.touch = new Touch({
			canvas: canvas
		});

		$(document).addEvent('keydown', this.handleKeyPress.bind(this));
		$(document).addEvent('schwipe', this.handleSwipe.bind(this));

		var background = new Image();
		background.onload = function() {
			renderer.renderBackground(this);
		}
		background.src = 'images/background.jpg';

		this.separator = new Image();
		this.separator.src = 'images/line.png';

		this.start();
	},

	handleKeyPress: function(e) {
		this.games[1].performAction(e.key);
		e.preventDefault();

	},

	// handle a swipe gesture by any one or more fingers
	handleSwipe: function(e) {
		var dir = e.direction;
		var origin = e.origin;

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
		this.renderer.render(game);
	},

	addGame: function(game) {
		this.games.push(game);
	},

	start: function() {
		this.stop();
		this.timer = setInterval(this.tick.bind(this), 500);
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

	//	var fingers = this.touch.getFingers();
	//	this.renderer.renderFingers(fingers);

		if(this.separator.complete) {
			this.renderer.renderLine(this.separator);
		}
	}

});


/**
 * game
 * 
 */




$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});