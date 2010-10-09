GameData: new Class({
	Implements: [Options, Events],
	options: {
		blocksWidth: 16, // available number of blocks in width (480 / 16 )
		blocksHeight: 17, // available number of blocks in height
	}
	var grid = [
		[ 0,1,1,1,3,3,3,0,0,2,2,2,2,0,0,0 ],
		[ 0,0,1,2,1,3,1,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,2,2,1,4,4,4,4,0,0,0,0,0,0,0 ],
		[ 0,0,2,0,1,0,1,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
	]

	// return howmany blocks are available for width
	getWidth: function() {


	},

	// return howmany blocks are available for height
	getHeight: function() {
		

	},


	doesFit(TetrisShapeObject, x,y) {

		
		// fire shape drop event if y -1 == collision
	},

	/** 
	 * Drop the blocks line by line, fire an event each time we made an iteration
	 */
	dropBlocks: function() {
		for(y= this.grid.length; y > -1; y--) {
			for(x=0; i< this.grid[y].length; x++) {
				
				
			}
		}
	},

	// remove the last line of the array
	removeLine: function() {
		removedLine = this.grid.shift();
		// push a new empty line
		var newRow Array(this.options.blockWidth);
		for(i=0;i<newRow.length; i++) {
			newRow[i] = 0;
		});
		this.grid.push(newRow);
	}

	/**
	 * Add a new line to the top of the array
	 */
	addLine: function(newLine) {
		this.grid.unshift(newLine);
		this.grid.pop();
	}


});


