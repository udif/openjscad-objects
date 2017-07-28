//
// Playing piece for Othello (half piece)
//
//include ('jscad-utils.jscad')
//include ('jscad-utils-color.jscad')
function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4, 5],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)',
		'ultra high (96,256)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['piece', 'ring', 'screw', 'flat_piece'],
        captions: ['piece (with connecting ring groove)', ' connecting ring', 'screw', 'flat piece (no ring groove)'],
        initial: 'piece_flat',
        caption: 'Part:'
    }];
}

function main(params) {
    var resolutions = [
        [6, 16],
        [8, 24],
        [12, 32],
        [24, 64],
        [48, 128],
        [96, 256]
];
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];
    //util.init(CSG);

    // Radius of part
	var base_r = 25/2;
	// Height of (half) part
	var base_height = 5.1/2;
	// Width of the flat ring at the edge
	var ring_width = 2.5;
	// Max Depth of curve in the middle
	var curve_depth=1.8;
	// Width of connecting ring
	var conn_w = 2 ; // ring_width/3;
	// Height of connecting ring
	var conn_h = 1;
	// extra width for tolerance
	var conn_tol = 0.15;
	// How many teeths
	var num_teeths = 6;
	var teeth_angle = 45;
	
	if (params.part == 'ring') {
		conn_h = (0.75 * conn_h) * 2; // when constructing ring needs to be twice as high to cover both parts
	} else {
		conn_h += conn_tol;
	}
	// Solve R^2 = (R-curve_depth)^2+(base_r-ring_width)^2
	// This is not a quadratic equation because R^2 cancels on both sides
	var r = (Math.pow((base_r-ring_width), 2)+Math.pow(curve_depth, 2))/(2*curve_depth)
	var base = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, base_height],
			radius: base_r
		}); //.rotateX(270).chamfer(0.5, 'z+').rotateX(90);
	var sphere_cut = CSG.sphere({
		center: [0, 0, r+base_height-1.8],
		radius: r
	});
	var ring_outer = CSG.cylinder({
		start: [0,0,0],
		end: [0, 0, conn_h],
		radius: (base_r-conn_w-conn_tol/2)
	});
	var ring_inner = CSG.cylinder({
		start: [0,0,0],
		end: [0, 0, conn_h],
		radius: (base_r-2*conn_w+conn_tol/2)
	});
	var ring = ring_outer.subtract(ring_inner);
	var flat_piece = base.subtract(sphere_cut);
	var piece_ring = flat_piece.subtract(ring);
	var teeth = ring.intersect(ring.subtract(CSG.cube ({
		radius: [base_r, base_r, base_r]
	}).translate([base_r,0,0])).rotateX(teeth_angle));
	
	var teeths = teeth;
	var i;
	for (i = 1; i < num_teeths; i++) {
		teeths = teeths.union(teeth.rotateZ(i*360/num_teeths));
	}
	var piece_teeth = flat_piece.union(teeths.translate([0, 0, -conn_h]));
	var piece_minus_teeth = flat_piece.subtract(teeths.translate([0, 0, -conn_h]).rotateX(180));
	switch (params.part) {
		case 'flat_piece':
			return flat_piece;
			
		case 'piece':
			return piece_ring;
			
		case 'screw':
			return union(piece_teeth, piece_minus_teeth.translate([0, 0, 10]));
			
		case 'ring':
			var cutout = CSG.cube ({
				radius: [2, base_r, conn_h/2]
			}).translate([0, base_r/2, conn_h/2]);
			ring_cutout = ring.subtract(cutout);
			return ring_cutout;
	}
}	
