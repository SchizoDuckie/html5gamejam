/**
 * controller
 * 
 */

TouchTris = new Class({
	
	initialize: function() {
		// init board
		// init emitter
		// init pieces bin
		// init powerups

		var player1 = new Game({});
		var player2 = new Game({});

		this.addGame(player1);
		this.addGame(player2);

		this.renderer = new Renderer({
			canvas: document.getElementById("game")
		});


		this.renderer.render(player1);

	},

	addGame: function(game) {
	},

	start: function() {
	},

	pause: function() {
	},

	tick: function() {
	}

});


/**
 * game
 * 
 */




$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});