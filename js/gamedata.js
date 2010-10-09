var GameData= new Class({

	Implements: [Options, Events],
	options: {
		blocksWidth: 16, // available number of blocks in width (480 / 16 )
		blocksHeight: 17 // available number of blocks in height
	},

	grid: [
		[ 0,1,1,1,3,3,3,0,0,2,2,2,2,1,0,4 ],
		[ 1,0,1,2,1,3,1,0,0,0,0,1,1,1,0,4 ],
		[ 1,0,2,2,1,4,4,4,4,6,0,5,5,5,5,4 ],
		[ 2,4,2,4,1,4,1,4,6,6,6,4,4,4,4,4 ],
		[ 2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3 ],
		[ 5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ]
	],

	initialize:function() {
		this.addEvent('blockDropped', this.recalcGrid);
		this.recalcGrid();
	},

	recalcGrid:function() {
		for(y = this.grid.length -1; y > 0; y--) {
			var toBeRemoved = true;
			var x = 0;
				
			while (x < this.options.blocksWidth && toBeRemoved == true)
			{
				if(this.grid[y][x] == 0) {
					toBeRemoved = false;
				}
				x++;
			}	
			if(toBeRemoved) this.removeLine(y);
		}
	},

	// get a specific point in the grid.
	get: function(x,y) {
		return(this.grid[y][x]);
	},

	// return howmany blocks are available for width
	getWidth: function() {
		return this.options.blocksWidth;

	},

	// return howmany blocks are available for height
	getHeight: function() {
		return this.options.blocksHeight;

	},

	getData: function() {
		return this.grid;
	},

	/**
	 * check if the current tetris shape object fits at pos x*y
	 *
	 * to do this: get a fix on x*y in the this.grid object
	 * get the this.
	 *
	 */
	doesFit: function(TetrisShapeObject, x,y) {
		var fits = false;
		for(y= this.grid.length; y > -1; y--) {
			for(x=0; i< this.options.blocksWidth; x++) {
				
				
			}
			this.fireEvent('blockplaced');
		}

		// fire shape drop event if y -1 == collision
	},

	/** 
	 * Drop the blocks line by line, fire an event each time we made an iteration
	 */
	dropBlocks: function() {
		for(y= this.grid.length; y > -1; y--) {
			for(x=0; i< this.options.blocksWidth; x++) {
				
				
			}
		}
	},

	getNewRow: function()
	{
		if(!this.newRow) {
			this.newRow = Array(this.options.blocksWidth); // push a new empty line
			for(i=0;i<this.newRow.length; i++) {
				this.newRow[i] = 0;
			}
		}
		return this.newRow;
	},

	// remove the a line in the grid, add a new line on top.
	removeLine: function(lineNumber) {
		var ln = lineNumber || 0;
		var removedLine = this.grid.splice(ln,1);
		this.grid.push(this.getNewRow());
	},

	/**
	 * Add a new line to the top of the array
	 */
	addLine: function(newLine) {
		this.grid.unshift(newLine);
		this.grid.pop();
	}


});


