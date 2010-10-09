/**
 * controller
 * 
 */

TouchTris = new Class({
	Implements: [Events],

	initialize: function() {
		this.games = [];

		// init board
		// init emitter
		// init pieces bin
		// init powerups

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

		this.renderer = new Renderer({
			canvas: document.getElementById("game")
		});


		this.start();
	},

	addGame: function(game) {
		this.games.push(game);
	},

	start: function() {
		this.stop();
		this.timer = setInterval(this.tick.bind(this), 100);
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
	}

});


/**
 * game
 * 
 */




$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});