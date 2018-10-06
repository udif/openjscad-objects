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
        values: ['left', 'right'],
        captions: ['left window switch', 'right window switch'],
        initial: 'left',
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
	var pin_h_l1 = 1.5;
	var pin_h_l2 = 1.5;
	var pin_h_r1 = 1.5;
	var pin_h_r2 = 1;
	var pin_w = 1.5;
	var pin_l = 2/2;
	var pin_r1 = 1/2;
	var pin_r2 = 1/2;

	var [pin_h1, pin_h2] = (params.part == 'left') ? [pin_h_l1, pin_h_l2] : [pin_h_r1, pin_h_r2];

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

	// Hold part in place using drilled holes in the original switch
	var pin1 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, pin_l+thickness/2],
			radius: pin_r1
		});
	var pin2 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, pin_l+thickness/2],
			radius: pin_r2
		});
		
	var piece =
	CSG.cube ({radius: [base_w/2, base_l/2, base_h/2]})
	.subtract(CSG.cube ({radius: [base_w/2-thickness, base_l/2-thickness, base_h/2]}))
	.subtract(pin1.rotateX(90).translate([-(base_w/2-pin_w), -(base_l/2-thickness), pin_h1-base_h/2]))
	.subtract(pin2.rotateX(-90).translate([-(base_w/2-pin_w),  (base_l/2-thickness), pin_h2-base_h/2]))
	.union(axis1.rotateX(90).translate([0, -(base_l/2-thickness/2), base_h/2-axis_r1]))
	.union(axis2.rotateX(-90).translate([0, (base_l/2-thickness/2), base_h/2-axis_r1]))
	.rotateX(180)
	.intersect(CSG.cube ({radius: [base_w/2, base_l/2+axis_l, base_h/2]}))
	//.subtract(CSG.cube ({radius: [base_w/2, 1, base_h/2]}).translate([-base_w/2, 0, 0]))
	;
	
	//
	// Render
	//
	switch (params.part) {
		case 'left':
				
		case 'right':
	}

	return piece;
}	
