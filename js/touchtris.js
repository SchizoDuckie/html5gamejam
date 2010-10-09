/**
 * controller
 * 
 */
// 1 player width* height = 
TouchTris = new Class({
	
	initialize: function() {
		// init board
		// init emitter
		// init pieces bin
		// init powerups
	//	alert(document.body.clientWidth + 'x'+ document.body.clientHeight);

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

	Implements: [Options],
	options: {
		screenWidth: 480,
		screenHeight: 510,
		blockHeight: 30,
		blockWidth: 30	

	}


	initialize: function(options) {
		this.setOptions(options);
		this.availWidth = 480
		this.availx510 
	},
})





$(window).addEvent('domready', function() {

	window.touchtris = new TouchTris();

});