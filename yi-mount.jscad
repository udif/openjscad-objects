//
// Mount for Yi Smart Dash camera
//
include ('jscad-utils.jscad')
include ('jscad-utils-color.jscad')
function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['combined', 'mount', 'camera'],
        captions: ['combined', 'mount', 'camera'],
        initial: 'combined',
        caption: 'Part:'
    }];
}

function main(params) {
    var resolutions = [
        [6, 16],
        [8, 24],
        [12, 32],
        [24, 64],
        [48, 128]
    ];
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];
    util.init(CSG);

	var base_z = 2.2;
	var base_stop_z = 4.5;
	var axis_height = 7;
	var axis_length = 10;
	var axis_width = 2;
	var axis_stop_width = 2;
	var pin_radius = axis_width /(2*Math.sin(360/8/2/(180/3.1415)));
	var base = CSG.cube({
			center: [0,0,0],
			radius: [17.5/2,36/2,base_z/2]
		}).rotateX(270).chamfer(0.5, 'z+').rotateX(90);
	var base_stop = CSG.cube({
			center: [0,0,0],
			radius: [24/2,2/2,base_stop_z/2]
		});
	var axis = CSG.cube({
			center: [0,0,0],
			radius: [axis_length/2,axis_width/2,axis_height/2]
		});
	var axis_stop = CSG.cube({
			center: [0,0,0],
			radius: [axis_stop_width/2,7.7/2,axis_height/2+((params.part == 'combined') ? 0 :axis_width)]
		});
	var base_stiffner = CSG.cube({
			center: [0,0,0],
			radius: [2/2,36/2,2/2]
		});

	var pin = CSG.cylinder({
		start: [0, 0, 0],
		end: [(axis_length+axis_stop_width), 0, 0],
		radius: pin_radius,
		resolution: 8
	}).rotateX(360/8/2);
	
	var yi = CSG.cube({
			center: [0,0,0],
			radius: [7.7/2,2/2,10/2]
		}).chamfer(0.5, 'z+').rotateX(90).rotateZ(-90); //.chamfer(0.5, 'z+').rotateX(180);
	
	yi = yi.union([
			axis.snap(yi, 'z', 'inside+').snap(yi, 'x', 'inside+'),
			axis_stop.snap(yi, 'z', 'inside+').snap(yi, 'x', 'outside-')
		]);
		
	if (params.part != 'combined') {
		yi = yi.union(pin.snap(yi, 'z', 'inside-').snap(yi, 'x', 'inside+'));
	}
	
	var socket = CSG.cube({
		center: [0, 0, 0],
		radius: [(axis_length+axis_stop_width)/2, 10, 6]
	});
	// The 0.05 factor works out for the combination of Tesla PETG clear filament, Prusa MK2S, 0.2mm
	// layer height. Your mileage may vary
	socket = socket.subtract(yi.snap(base, 'z', 'inside-').snap(socket, 'x', 'inside+').enlarge([0, .05, .05]));
	
	var base_axis  = base.union([
        base_stiffner.snap(axis, 'x', 'outside+').snap(base, 'z', 'outside-'),
        base_stiffner.snap(axis, 'x', 'outside-').snap(base, 'z', 'outside-'),
		base_stop.snap(base, 'y', 'outside-').translate([0,0,(base_stop_z-base_z)/2])
	]);
	var base_axis_yi = base_axis.union(yi.snap(base, 'z', 'outside-'));
	
	//
	// Render
	//
	switch (params.part) {
		case 'combined':
			return base_axis_yi;
		case 'mount':
			return base_axis.union(socket.snap(base, 'z', 'outside-').snap(axis, 'x', 'inside+'));
		case 'camera':
			return yi;
	}
}	
