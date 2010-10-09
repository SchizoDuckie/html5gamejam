var GameData= new Class({

	Implements: [Options, Events],
	options: {
		blocksWidth: 16, // available number of blocks in width (480 / 16 )
		blocksHeight: 17 // available number of blocks in height
	},

	grid: [
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
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
	canMove: function(Shape, x, y) {
		var fits = true;
		var points = Shape.transform(Shape.rotation);
		
		var nextX = Shape.x +x;
		var nextY = Shape.y +y;
		
		for (i=0; i  < points.length; i++)
		{
			var xMove = nextX + points[i][0]; // x
			var yMove = nextY + points[i][1]; // y;
			if(yMove == 0  || Shape.y > this.getHeight() || this.grid[yMove] && this.grid[yMove][xMove] && this.grid[yMove][xMove] > 0) {
				return false;	
			}
		}
		return fits;

		// fire shape drop event if y -1 == collision
	},

	gameOver: function() {
		for(i=0; i<  this.grid[this.grid.length]; i++) {
			if(this.grid[this.grid.length][i] > 0) return true;
		}
	},

	// place the block in the internal grid on position x*y, since that waspossible.
	placeShape: function(Shape) {
		console.debug('place shape ', Shape);
		var points = Shape.transform(Shape.rotation);
		// loop all rotated points
		console.log("placing shape for points: ", points.join("\n") + "@ "+ Shape.x+'*'+Shape.y);
		for(i=0; i<points.length;i++) {	
			// mark all the points in the grid as the type of shape.getType
			if(Shape.y + points[i][1] >= this.getHeight()) this.gameOver();
			this.grid[Shape.y + points[i][1]][Shape.x + points[i][0]] = Shape.getType();
				
		
			//console.log("Current grid: ", this.grid.join("\n"));
		}
		//this.fireEvent('blockplaced');
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


