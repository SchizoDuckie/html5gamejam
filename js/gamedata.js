var GameData= new Class({

	Implements: [Options, Events],
	options: {
		blocksWidth: 16, // available number of blocks in width (480 / 16 )
		blocksHeight: 17 // available number of blocks in height
	},

	grid: [
		[ 1,3,2,5,5,3,2,1,6,1,0,1,1,1,1,1 ],
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
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ],
		[ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ]
	],

	initialize:function() {
		this.addEvent('blockDropped', this.recalcGrid);
		this.recalcGrid();
	},

	recalcGrid:function() {
		for(y = this.grid.length -1; y >= 0; y--) {
			var toBeRemoved = true;
			var x = 0;
			if(this.options.bloksHeight < y) {
				tobeRemoved = true; 
			}
			else 
			{	
				while (x < this.options.blocksWidth && toBeRemoved == true)
				{
					if(this.grid[y][x] == 0) {
						toBeRemoved = false;
					}
					x++;
				}
			}
			if(toBeRemoved) this.removeLine(y);
		}
		if(this.options.blocksHeight > this.grid.length) {
			while(this.options.blocksHeight > this.grid.length) {
				this.grid.unshift(this.getNewLine());
			}
		
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
	
	setHeight: function(newHeight) {
		this.options.blocksHeight = newHeight;
		this.recalcGrid();
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
	canMove: function(points, x,y) {
		var fits = true;
		if (y<0) return false;
		
		for (i=0; i  < points.length; i++)
		{
			if (parseInt(y + points[i][1]) < 0) return false;
			
			var xMove = x + points[i][0]; // x
			var yMove = y + points[i][1]; // y;
			if(yMove < 3 ) {
				//console.log(('CanMove shape to  x: '+ xMove +"* y: " + yMove), points.join('|'));
			}
		
			//console.debug(xMove+'x'+yMove+" " + points.join('|'));
			//console.debug("CanMove: "+points[i]+" from "+y + "x"+x+" to "+(x + points[i][0])+ "x"+ (y+ points[i][1]));
			if(yMove < 0 || xMove == -1 || xMove >= this.getWidth() || (this.grid[yMove] && this.grid[yMove][xMove] && this.grid[yMove][xMove] > 0)) {
				fits = false;	
			}
		}
		return fits;

		// fire shape drop event if y -1 == collision
	},


	// place the block in the internal grid on position x*y, since that waspossible.
	placeShape: function(points, type,  x, y) {
		if (y < 0) y = 0;
	//	console.log('Place shape of type: '+type + "@  x: "+ x +"* y: " + y, points.join('|'));
		// loop all rotated points
		
		for(i=0; i< points.length; i++) {	 try
		{
		this.grid[y + points[i][1]][x + points[i][0]] = type;	
		}
		catch (e)
		{
//console.debug("Could not place shape at "+(y+points[i][1])+ ", "+ (x + points[i][0]));
			//debugger;
		}
			
			
			//console.log("Current grid: ", this.grid.join("\n"));
		}
		this.fireEvent('blockdropped');
		//$('grid').set('text', this.grid.join("\n"));
		this.recalcGrid();
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
		for(i=0;i<removedLine.length; i++) {
			if(removedLine[i] > 4) { // fire special powerup event.
				this.fireEvent('powerup', this.removedLine[i]);
			}
		}
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


