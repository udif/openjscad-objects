//
// DC cable plug for Multi-X lamp
//
include ('jscad-utils.jscad')
include ('jscad-utils-color.jscad')
//include ('jscad-utils-parts.jscad')
//include ('jscad-boxes.jscad')

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
        values: ['piece', 'flat_piece'],
        captions: ['piece',  'piece with larger hold'],
        initial: 'flat_piece',
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
    util.init(CSG);

    // Radius of small pin
	var fillet_r = 1;
	var width = 23;
	var length1 = 34;
	var length2 = 34 - 7.5;
	var length3 = 20;
	var thick1 = 6;
	var thick2 = 8.5;
	var thick3 = 12;
	var pin_r = 3/2;
	var pin_spacing = 7;
	var pin_length = 20;

	var bounding1 = CSG.cube({
			center: [0,length1/2,thick2/2],
			radius: [width/2,length1/2,thick2/2]
		});
	var bounding2 = CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2,thick2/2]
		});
	var bounding3 = CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2,thick3/2]
		});
	var plug1 = CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2+fillet_r,thick1/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90);
	var plug2 = CSG.cube({
			center: [0,(2*length1-length2)/2,0],
			radius: [width/2,length2/2+fillet_r,thick2/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90);
	var plug3 = CSG.cube({
			center: [0,(2*length1-length3)/2,0],
			radius: [width/2,length3/2+fillet_r,thick3/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90);

	var pin = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, pin_length],
			radius: pin_r
		}).rotateX(90).translate([0, length1/2, 0]);
	var pins = union(pin, pin.translate([pin_spacing, 0, 0]), pin.translate([-pin_spacing, 0, 0]));
	/*
	var large_cyl = CSG.cylinder({
			start: [0,0,small_height],
			end: [0, 0, total_height-large_r],
			radius: large_r
		});
	var half_dome = CSG.sphere({
		center: [0, 0, total_height-large_r],
		radius: large_r
	});
	var tooth = CSG.cube({
			center: [0,0,small_height+tooth_z/2],
			radius: [tooth_x/2,tooth_y/2,tooth_z/2]
		});
	*/
	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return union(plug1, plug2, plug3).subtract(pins).intersect(bounding1);

		case 'flat_piece':
			return union(plug1, plug2, plug3).subtract(pins).intersect(bounding2);
	}

}	