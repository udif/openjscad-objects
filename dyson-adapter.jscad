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
        name: 'length',
        type: 'float',
        initial: 50.0,
        caption: 'Total adapter Length'
    }, {
        name: 'notch_w',
        type: 'float',
        initial: 4.5,
        caption: 'width of the notch'
    }, {
        name: 'notch_r',
        type: 'float',
        initial: 31.35/2,
        caption: 'radius of the notch holding the part'
    }, {
        name: 'notch_h',
        type: 'float',
        initial: 10,
        caption: 'height where nbotch starts'
    }, {
        name: 'notch_slope',
        type: 'float',
        initial: 1,
        caption: 'slope of the notch'
    }, {
        name: 'inner_r',
        type: 'float',
        initial: 29.66/2,
        caption: 'Inner radius'
    }, {
        name: 'outer_r',
        type: 'float',
        initial: 34/2,
        caption: 'Outer radius'
    }, {
        name: 'invert',
        type: 'checkbox',
        checked: false,
        caption: 'draw part upside-down (for STL import)'
    }, {
        name: 'base',
        type: 'checkbox',
        checked: true,
        caption: 'draw flat base'
    }, {
        name: 'base_thickness',
        type: 'float',
        initial: 0.2,
        caption: 'Thickness of base (if enabled)'
    }, {
        name: 'part',
        type: 'choice',
        values: ['piece', 'piece_with_slot'],
        captions: ['piece',  'piece with middle slot'],
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
	// The narrow radius , sa as the lens radius
	var inner_r = params.inner_r;
	// A bit wider, giving space to the lens buttons
	var notch_r = params.notch_r;
	var notch_h = params.notch_h;
	var notch_w = params.notch_w;
	// Outer diameter of the adapter
	var outer_r = params.outer_r;
	// Adapter length
	var length = params.length;
	// Length of the inner space for buttons
	var inner_length = params.inner_length;
	// Length of the inner cone where we change from inner wide to inner narrow width
	var notch_slope = params.notch_slope;

	//
	// Calculated:
	//


	// Main cylinder
	var notch = CSG.cylinder({
			start: [0,0,notch_h],
			end: [0, 0, notch_h+notch_w+(outer_r-notch_r)*notch_slope],
			radius: outer_r
		}).subtract(CSG.cylinder({
			start: [0,0,notch_h],
			end: [0, 0, notch_h+notch_w+(outer_r-notch_r)*notch_slope],
			radius: notch_r
		}));
	var slope = CSG.cylinder({
			start: [0,0,notch_h+notch_w],
			end: [0, 0, notch_h+notch_w+(outer_r-notch_r)*notch_slope],
			radiusStart: notch_r,
			radiusEnd: outer_r
		});
	var cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: outer_r
		}).subtract(notch).union(slope)
		.subtract(CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: inner_r
		}));
	var base = cyl;
	if (params.invert) {
		base = base.rotateX(180).translate([0, 0, length]);
	}
	if (params.base) {
		base = base.union(CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, params.base_thickness],
			radius: outer_r
		}));
	}

	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return base;		
	}
}	
