//
// Dyson DC34 adapter with a flat nozzle for sucking air out of Vaccum bags
//
function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4, 5],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)',
		'ultra high (96,256)'],
        initial: 4,
        caption: 'Resolution:'
    }, {
        name: 'arena_top',
        type: 'float',
        initial: 60.0,
        caption: 'Top length of Beyblade arena borders'
    }, {
        name: 'arena_w',
        type: 'float',
        initial: 3,
        caption: 'width of the Beyblade arena borders'
    }, {
        name: 'arena_r',
        type: 'float',
        initial: 200,
        caption: 'outer radius of the Beyblade arena'
    }, {
        name: 'arena_h',
        type: 'float',
        initial: 20,
        caption: 'height of Beyblade arena playground'
    }, {
        name: 'arena_slope_r',
        type: 'float',
        initial: 180.0,
        caption: 'arena slope radius'
    }, {
        name: 'arena_slope_d',
        type: 'float',
        initial: 8.0,
        caption: 'arena slope depth'
    }, {
        name: 'notch_r',
        type: 'float',
        initial: 6,
        caption: 'notch  radius'
    }, {
        name: 'notch_l',
        type: 'float',
        initial: 10,
        caption: 'notch length'
    }, {
        name: 'part',
        type: 'choice',
        values: ['piece', 'test_pin', 'test_notch'],
        captions: ['piece',  'test block for pin', 'test block for notch'],
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

	//
	// Input parameters
	//
	var pi = 3.14159;
	// A bit wider, giving space to the lens buttons
	var arena_r = params.arena_r;
	var arena_h = params.arena_h;
	var arena_w = params.arena_w;
	var arena_top = params.arena_top;
	var arena_slope_r = params.arena_slope_r;
	var arena_slope_d = params.arena_slope_d;
	// Outer diameter of the adapter
	var notch_l = params.notch_l;
	var notch_r = params.notch_r;
	var pin_l = notch_l - 2;

	//
	// Calculated:
	//


	// Main cylinder
	var arena_qtr = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, arena_h],
			radius: arena_r
		}).union(CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, arena_top],
			radius: arena_r
		}).subtract(CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, arena_top],
			radius: (arena_r - arena_w)
		}))
		).subtract(CSG.sphere({
			center: [0,0,0],
			radius: (arena_slope_r)
		}).scale([1, 1, arena_slope_d/arena_slope_r])
			.translate([0, 0, arena_h]))
		.intersect(CSG.cube({
			corner1: [0, 0, 0],
			corner2: [arena_r, arena_r, arena_top]})
		);
	var notch = CSG.cylinder({
			start: [0,0,0],
			end: [notch_l+1, 0, 0],
			radius: notch_r,
			resolution: 8
		}).rotateX(360/8/2).translate([0, 0, notch_r*Math.sin((360/8/2)*(180/pi))]);
	var pin = CSG.cylinder({
			start: [0,0,0],
			end: [0, pin_l, 0],
			radius: notch_r-0.1,
			resolution: 8
		}).rotateY(360/8/2).translate([0, 0, notch_r*Math.sin((360/8/2)*(180/pi))]);
	var arena_notch_pin = arena_qtr
		.union(pin.translate([arena_r*1/3, -pin_l, 0]))
		.union(pin.translate([arena_r*2/3, -pin_l, 0]))
		.subtract(notch.translate([0, arena_r*2/3, 0]))
		.subtract(notch.translate([0, arena_r*1/3, 0]))
		;
	//	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return arena_notch_pin;
		case 'test_pin':
			return arena_notch_pin.intersect(CSG.cube({
			center: [0, arena_r*1/3, notch_r],
			radius: [notch_l+5, notch_r+5, notch_r+5]}));
		case 'test_notch':
			return arena_notch_pin.intersect(CSG.cube({
			center: [arena_r*1/3, -pin_l/2, notch_r],
			radius: [notch_r+5, pin_l/2+5, notch_r+5]}));
	}
}	
