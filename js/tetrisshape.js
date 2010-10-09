TetrisShape = new Class({
	shapeData: {
		// Square
		Square: { 
			shape: [ [-1, 0], [0,-1],[-1,0], [0,0] ],
			probability: 1,
			mirrorable: false	
		},
		// L shape
		L: { 
			shape: [ [-1,-2], [-1, -1], [-1,0], [0,0]  ], 
			probability: 0.8,
			mirrorable: true
		},
		// Line 
		Line: { 
			shape: [ [0,-2], [0, -1], [0,0], [0,1] ],  
			probability: 1,
			mirrorable: false
		},
		// S-shape
		S: { 
			shape: [ [-1,0], [0,0], [0, -1], [1,-1] ],
			probability: 1,
			mirrorable: true
		}
		// Pyramid shape
		Pyramid: {
			shape: [ [0,-1], [-1,0], [0,0], [1,0]  ],
			probability: 1,
			mirrorable: false

		}
	}

	// choose a new block
	// based on probability 
	// rotate it random, mirror it random if mirrorable.
	initialize: function() {
		

	},

	// rotates the dataset for this shape
	rotate: function(direction) {
	
	},

	// mirror the dataset for this shape
	mirror: function() {

	},
	
	// return the currently active shapeData in the currently rotated way
	getShape: function() {
		
	}
});
