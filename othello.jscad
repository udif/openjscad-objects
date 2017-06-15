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
        values: ['piece', 'ring', 'flat_piece'],
        captions: ['piece (with connecting ring groove)', ' connecting ring', 'flat piece (no ring groove)'],
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
	// Where to place connecting ring
	var conn_r = base_r-ring_width/2;
	// Width of connecting ring
	var conn_w = 1;
	// extra width for tolerance
	var conn_w_tol = 0.1;
	// Height of connecting ring
	var conn_h = 1;
	
	if (params.part == 'ring') {
		conn_h *=2; // when constructing ring needs to be twice as high to cover both parts
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
			radius: (conn_r+(conn_w-conn_w_tol)/2)
		});
	var ring_inner = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, conn_h],
			radius: (conn_r-(conn_w-conn_w_tol)/2)
		});
	var ring = ring_outer.subtract(ring_inner);
	var flat_piece = base.subtract(sphere_cut);
	var piece_ring = flat_piece.subtract(ring);
	switch (params.part) {
		case 'flat_piece':
			return flat_piece;
			
		case 'piece':
			return piece_ring;
			
		case 'ring':
			return ring;
	}
}	
