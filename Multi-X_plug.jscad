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
        values: ['piece', 'half_piece_u', 'half_piece_d', 'holes_only'],
        captions: ['piece',  'upper piece to be used', 'lower piece to be used', 'holes only'],
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
	var pin_spacing = 8;
	var pin_length = 20;
	var slot_loc = pin_spacing/2;
	var slot_w = 1.5;
	var cable_r = 3;
	var cable_length = 10;
	var walls_x = 2; // internal walls thickness
	var walls_y1 = 8; // internal walls thickness
	var walls_y2 = 2; // internal walls thickness
	var walls_z = 6; // internal walls thickness

	var bounding_u = CSG.cube({
			corner1: [-width/2, 0, 0],
			corner2: [width/2, length1, thick2]
		});
	var bounding_d = CSG.cube({
			corner1: [-width/2, 0, 0],
			corner2: [ width/2, length1, -thick2]
		});
	var slot = CSG.cube({
			center: [-slot_loc,length1/2-(length2-length3),(thick2+thick1)/4],
			radius: [slot_w/2,(length2-length3)/2,(thick2-thick1)/4]
		});

	var bounding3 = CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2,thick3/2]
		});
	var plug1 = CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2+fillet_r, thick1/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90)
		.intersect(CSG.cube({
			center: [0,length1/2,0],
			radius: [width/2,length1/2,thick2/2]
		}));
	var plug2 = CSG.cube({
			center: [0,(2*length1-length2)/2,0],
			radius: [width/2,length2/2+fillet_r, thick2/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90)
		.intersect(CSG.cube({
			center: [0,(2*length1-length2)/2,0],
			radius: [width/2,length2/2,thick2/2]
		}));
	var plug3 = CSG.cube({
			center: [0,length1-length3/2,0],
			radius: [width/2,length3/2+fillet_r, thick3/2]
		}).rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90)
		.intersect(CSG.cube({
			center: [0, length1-length3/2,0],
			radius: [width/2, length3/2, thick3/2]
		}));
	var plug3h = CSG.roundedCube({
			center: [0,length1-length3/2-(walls_y1-walls_y2)/2,0],
			radius: [(width-walls_x)/2, (length3-walls_y1-walls_y2)/2, (thick3-walls_z)/2],
			roundradius: fillet_r,
			resolution : CSG.defaultResolution3D
		})
		//.rotateY(90).fillet(fillet_r, 'z+').rotateY(180).fillet(fillet_r, 'z+').rotateY(90)
		//.intersect(CSG.cube({
		//	center: [0, length1-length3/2-(walls_y1-walls_y2)/2,0],
		//	radius: [(width-walls_x)/2, (length3-walls_y1-walls_y2)/2, (thick3-walls_z)/2]
		//}))
		;
	//var plug3h = plug3.scale([util.scale(width, -walls_x), util.scale(length3, -walls_y), util.scale(thick3, -walls_z)]);
	var hole1 = CSG.cylinder({
		start: [(width/2+cable_r)/2, length1-walls_y1/2, 0],
		end: [(width/2+cable_r)/2, length1-walls_y1/2, thick3],
		radius: 2.8/2
	});
	var hole2 = CSG.cylinder({
		start: [-(width/2+cable_r)/2, length1-walls_y1/2,0],
		end: [-(width/2+cable_r)/2, length1-walls_y1/2, thick3],
		radius: 2.8/2
	});
	var pin = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, pin_length],
			radius: pin_r
		}).rotateX(90).translate([0, length1/2, 0]);
	var cable = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, cable_length],
			radius: cable_r
		}).rotateX(90).translate([0, length1, 0]);
	var pins = union(pin, pin.translate([pin_spacing, 0, 0]), pin.translate([-pin_spacing, 0, 0]));
	//
	// Render
	//
	var cutout = union(pins, slot, cable, plug3h, hole1, hole2);
	var shape = union(plug1, plug2, plug3).subtract(cutout);
	switch (params.part) {
		case 'piece':
			return shape;

		case 'half_piece_u':
			return shape.intersect(bounding_u);

		case 'half_piece_d':
			return shape.intersect(bounding_d);

		case 'holes_only':
			return cutout;
	}

}	