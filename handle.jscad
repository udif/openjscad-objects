//
// Handle for kids game)
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
        values: ['all', 'top', 'bottom'],
        captions: ['all', 'top', 'bottom'],
        initial: 'all',
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
	var base_height = 15;
	var base_r = 14/2;
	var base_w = base_r - 2.5;
	var ring_start = 1;
	var ring_height = 3.5;
	var ring_rad = 11/2;
	var rod_rad = 8/2;
	var hole_x = 5;
	var hole_rad = 3.2/2;
	var hex_depth = 3;
	var handle = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, base_height],
			radius: base_r
		}); //.rotateX(270).chamfer(0.5, 'z+').rotateX(90);
	var ring_cut = union(
		CSG.cylinder({
			start: [0,0,ring_start],
			end: [0, 0, ring_height],
			radius: ring_rad
		}), 
		CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, ring_start],
			radius: rod_rad
		})
	);
	var hex_bolt = CSG.cylinder({               // and its rounded version
		start: [-(base_height-hole_x), 0, base_w-hex_depth],
		end: [-(base_height-hole_x), 0, base_r],
		radius: 3.3,
		resolution: 6
	});
	var screw = CSG.cylinder({               // and its rounded version
		start: [-(base_height-hole_x), 0, -base_w],
		end: [-(base_height-hole_x), 0, base_r],
		radius: hole_rad
	});
	var screw_head = CSG.cylinder({               // and its rounded version
		start: [-(base_height-hole_x), 0, -(base_w-2)],
		end: [-(base_height-hole_x), 0, -(base_w-4)],
		radiusStart: 3,
		radiusEnd: 1.5
	}).union(CSG.cylinder({               // and its rounded version
		start: [-(base_height-hole_x), 0, -base_r],
		end: [-(base_height-hole_x), 0, -(base_w-2)],
		radius: 3.2
	}));
	var handle_ring = handle.subtract(ring_cut)
		.rotateY(-90)
		.intersect(CSG.cube ({
		radius: [base_height, base_r, base_r]
	}).translate([0, 0, (base_r-base_w)]))
	.subtract(hex_bolt)
	.subtract(screw_head)
	.subtract(screw);
	var top = handle_ring.intersect(CSG.cube ({
		radius: [base_height, base_r, base_r]
	}).translate([0,0,base_r]));
	var bottom = handle_ring.intersect(CSG.cube ({
		radius: [base_height, base_r, base_r]
	}).translate([0,0,-base_r]));

	//
	// Render
	//
	switch (params.part) {
		case 'all':
			return union(top, bottom);
			
		case 'top':
			return top;
			
		case 'bottom':
			return bottom.rotateX(180);
	}
}	
