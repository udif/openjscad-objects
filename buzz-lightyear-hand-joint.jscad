//include ('jscad-utils.jscad')
//include ('jscad-utils-color.jscad')
//include ('jscad-utils-parts.jscad')

function getParameterDefinitions() {

    return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 3,
        caption: 'Resolution:'
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
	//document.write(JSON.stringify(params));
	//util.init(CSG);

	var pi = 3.14159;
	var ring_width = 6.2;
	var ring_thickness = 1.6;
	var ring_radius = 21.9/2;
	var disc_width = ring_width - 2*2.1;
	var inner_radius = 9/2;
	var inner_width = 6.2-1;
	var hole_radius = 5/2;
	var pipe_r = 6;
	var pipe_l = 6;
	var plate_width = 9.3;
	var plate_length = 12;
	var plate_thickness = 2;

	var half_ring = CSG.cylinder({
		start: [0, 0, 0],
		end: [0, 0, ring_width/2],
		radiusStart: ring_radius,
		radiusEnd: ring_radius-0.05
	}).subtract(CSG.cylinder({
		start: [0, 0, 0],
		end: [0, 0, ring_width/2],
		radius: ring_radius-ring_thickness
	}));
	var disc = CSG.cylinder({
		start: [0, 0, -disc_width/2],
		end: [0, 0, disc_width/2],
		radius: ring_radius-ring_thickness
	}).union(CSG.cylinder({
		start: [0, 0, -inner_width/2],
		end: [0, 0, inner_width/2],
		radius: inner_radius
	})).subtract(CSG.cylinder({
		start: [0, 0, -inner_width/2],
		end: [0, 0, inner_width/2],
		resolution: 6,
		// calculate radius of bounding circle to polygon given the required bounded circle radius
		radius: hole_radius / Math.cos((360/6)/2/(180/pi))
	}).rotateZ(360/6/2));
	var ring = half_ring.union(half_ring.rotateX(180));
	var wire_in = cube({
		size : [ring_thickness+2, 3.6, (ring_width-disc_width)/2],
		center: [true, true, false]}
	).translate([-(ring_radius-ring_thickness/2), -1, disc_width/2]);
	var handle = CSG.cylinder({
		start: [ring_radius-ring_thickness, 0, 0],
		end: [(ring_radius+pipe_l), 0, 0],
		radius: pipe_r/2
	});
	var handle_hole = CSG.cylinder({
		start: [(ring_radius-ring_thickness+inner_radius)/2, 0, 0],
		end: [(ring_radius+pipe_l+plate_thickness+1), 0, 0],
		radius: pipe_r/4
	});
	var plate = cube({
		size: [plate_thickness, plate_width, plate_length],
		center: [false, true, true]
	}).translate([(ring_radius+pipe_l), 0 ,0]);
	
	//var cyl3 = CSG.cylinder({ start: [0, 0, 2+19], end: [0, 0, 2+19+2], radius: 40/2});

	return ring.union([disc, handle, plate]).subtract(handle_hole).subtract(wire_in);
}