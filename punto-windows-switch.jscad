//
// Electric window fix for Punto
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
        values: ['piece'],
        captions: ['piece'],
        initial: 'piece',
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
	var base_l = 13.8;
	var base_w = 13.4;
	var thickness = 1.0;
	// Height of (half) part
	var base_h = 6.4;
	var axis_l = 4.7/2;
	var axis_r1 = 1.9/2;
	var axis_r2 = 2.9/2;

	var axis1 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, axis_l+thickness/2],
			radius: axis_r1
		});
	var axis2 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, axis_l+thickness/2],
			radius: axis_r2
		});

	var piece =
	CSG.cube ({radius: [base_w/2, base_l/2, base_h/2]})
	.subtract(CSG.cube ({radius: [base_w/2-thickness, base_l/2-thickness, base_h/2]}))
	.union(axis1.rotateX(90).translate([0, -(base_l/2-thickness/2), base_h/2-axis_r1]))
	.union(axis2.rotateX(-90).translate([0,  (base_l/2-thickness/2), base_h/2-axis_r1]))
	.rotateX(180)
	.intersect(CSG.cube ({radius: [base_w/2, base_l/2+axis_l, base_h/2]}))
	;

	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return piece;
	}
}	
