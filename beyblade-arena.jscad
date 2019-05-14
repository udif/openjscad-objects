//
// Beyblade rink, V2
//
const fn = 48;

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
        initial: 195.0,
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

function base_cut(r, w, h) {
    return difference(
        cylinder({r1:r+w/2+h, r2:r+w/2, h:h, fn:fn}),
        cylinder({r1:r-w/2-h, r2:r-w/2, h:h, fn:fn})
    );
}

function middle_cut(r, w, h) {
    var c1 = base_cut(r, w, h);
    return union(c1, c1.rotateX(180));
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
    const fn = 48;
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
	const steps = 60;

	//
	// Calculated:
	//


	// Main cylinder
	let arena_wall =
	    difference(
			cylinder({
				h: arena_top,
				r: arena_r,
				center: [true, true, false],
				fn: fn
			}),
			cylinder({
				h: arena_top,
				r: (arena_r - arena_w),
				center: [true, true, false],
				fn: fn
			})
		);

	var arena_qtr1 =
    	difference(
    		union(
    			cylinder({
    			    h: arena_h,
    				r: arena_r,
    				center: [true, true, false],
					fn: fn
    			}),
    			arena_wall
    		),
    		translate([0, 0, arena_top],
            	scale([1, 1, arena_slope_d/arena_slope_r],
            	    sphere({
                		r: (arena_slope_r),
                		center:true,
        				fn: fn
                	})
                )
            )
    	);
    
	var points1 = Array(34);
	var points2 = Array(34);
	var arena_base = notch_r*2;
	var t;
	for (i = 0; i <= steps; i++) {
	    points1[i] = [i*arena_slope_r/steps, arena_base+((arena_top-arena_base)/(steps+1-i))];
	    t = arena_base+((arena_top-arena_base)/(steps+1-i))-5;
	    points2[i] = [i*arena_slope_r/steps+5,
	                  (i < 0.73*steps) ? 0.01 :
	                  (i > 0.9*steps) ? t :
	                  min(t, (i-0.75*steps)*0.6*arena_slope_r/steps+5)];
	}
	points1[steps+1] = [arena_r, arena_top];
	points1[steps+2] = [arena_r, 0];
	points1[steps+3] = [0, 0];
	points2[steps+1] = [arena_r+5, arena_top+5];
	points2[steps+2] = [arena_r+5, 0];
	points2[steps+3] = [0, 0];
	arena_qtr1 = rotate_extrude({fn:fn}, polygon({points: points1}));
	arena_qtr2 = rotate_extrude({fn:fn}, polygon({points: points2}));

	var arena_qtr =
        intersection(
	        difference(
    	        arena_qtr1,
    	        arena_qtr2,
    	        base_cut((arena_base+1), 2, arena_base-1),
    	        middle_cut(2*(arena_base+1), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]),
    	        base_cut(3*(arena_base+1), 2, arena_base-1),
    	        middle_cut(4*(arena_base+1), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]),
    	        base_cut(7*(arena_base+1)-3, 2, arena_base-1),
    	        middle_cut(8*(arena_base+1)-3, 2, (arena_base-3)/2).translate([0, 0, arena_base/2]),
    	        base_cut(9*(arena_base+1)-3, 2, arena_base-1)
    	    ),
	        cube({
    			center: [false, false, false],
    			size: [arena_r, arena_r, arena_top]
    	    })
		);

	var notchX = CSG.cylinder({
			start: [0,0,0],
			end: [notch_l+1, 0, 0],
			radius: notch_r,
			resolution: 8
		}).rotateX(360/8/2).translate([0, 0, notch_r*Math.sin((360/8/2)*(180/pi))]);
	var notchY = CSG.cylinder({
			start: [0,0,0],
			end: [notch_l+1, 0, 0],
			radius: notch_r,
			resolution: 8
		}).rotateX(360/8/2).rotateZ(90).translate([0, 0, notch_r*Math.sin((360/8/2)*(180/pi))]);
	var pin = CSG.cylinder({
			start: [0,0,0],
			end: [0, pin_l, 0],
			radius: notch_r-0.1,
			resolution: 8
		}).rotateY(360/8/2).translate([0, 0, notch_r*Math.sin((360/8/2)*(180/pi))]);
	var arena_notch_pin = arena_qtr
		.subtract(notchY.translate([arena_r*1/3, 0, 0]))
		.subtract(notchY.translate([arena_r*2/3, 0, 0]))
		.subtract(notchX.translate([0, arena_r*2/3, 0]))
		.subtract(notchX.translate([0, arena_r*1/3, 0]))
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
			return arena_notch_pin
			.intersect(CSG.cube({
				center: [arena_r*1/3, -pin_l/2, notch_r+0.1],
				radius: [notch_r+5, pin_l/2+5, notch_r+5-0.1]}))
			.union(arena_notch_pin.intersect(CSG.cube({
				radius: [notch_r+15, 15, 0.1]})));
				//center: [arena_r*1/3, 0, 0.1],
	}
}	
