/**
 * matrix
 * 
 */

function Matrix(base) {
	this.base = base || [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
}

Matrix.prototype = {
	concat:function(matrix) {
		var m1 = this.base;
		var m2 = matrix.base? matrix.base:matrix;
		var mc = new Matrix().base;
		for(var i=0; i<3; i++) {
			for(var j=0; j<3; j++) {
				mc[i][j] = 
				m1[i][0] * m2[0][j] +
				m1[i][1] * m2[1][j] +
				m1[i][2] * m2[2][j]
			}
		}	this.base = mc;
		return this;
	},

	scale:function(sx, sy) {
		var m = [
			[sx, 0,  0],
			[0,  sy, 0],
			[0,  0,  1]
		];	return this.concat(m);
	},

	translate:function(dx, dy) {
		var m = [
			[1, 0, dx],
			[0, 1, dy],
			[0, 0, 1 ]
		];	return this.concat(m);
	},

	rotate:function(r) {
		var sin = Math.sin(r), cos = Math.cos(r);
		var m = [
			[ cos, sin, 0],
			[-sin, cos, 0],
			[ 0,   0,   1]
		];	return this.concat(m);
	}, 

	copy:function() {
		return new Matrix().concat(this);
	}
}