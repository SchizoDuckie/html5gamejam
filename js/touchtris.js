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

Game = new Class({
	initialize: function(options) {

	}
})



$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});