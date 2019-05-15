//
// Beyblade rink, V2
//
const fn = 48;

function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'int',
        initial: 48,
        caption: 'Number of divisions of a circle:'
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
        cylinder({r1:r+w/2+h, r2:r+w/2, h:h, fn:16}),
        cylinder({r1:r-w/2-h, r2:r-w/2, h:h, fn:16})
    ).rotateZ(360/32);
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
    const fn = params.resolution;
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

    function slope(i) {
        return arena_base + arena_slope_d*i/steps + ((arena_top-arena_base-arena_slope_d)/(steps+1-i))
    }

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
    
	var points1 = Array(steps+4);
	var points2 = Array(steps+4);
	var arena_base = notch_r*2;
	var t, th, th2;
	for (i = 0; i <= steps; i++) {
	    points1[i] = [i*arena_slope_r/steps, slope(i)];
	    t = slope(i)-5;
	    points2[i] = [i*arena_slope_r/steps+5,
	                  (i < 0.93*steps) ? 0.01 :
	                  (i > 0.95*steps) ? t :
	                  min(t, (i-0.93*steps)*0.6*arena_slope_r/steps+5)];
	}
	points1[steps+1] = [arena_r, arena_top];
	points1[steps+2] = [arena_r, 0];
	points1[steps+3] = [0, 0];
	points2[steps+1] = [arena_r+5, arena_top+5];
	points2[steps+2] = [arena_r+5, 0];
	points2[steps+3] = [0, 0];
	arena_qtr1 = rotate_extrude({fn:fn}, polygon({points: points1}));
	arena_qtr2 = rotate_extrude({fn:fn}, polygon({points: points2}));

	var arena_qtr = difference(arena_qtr1, arena_qtr2);
    for (i = 1; i < 15; i++) {
        t = (i & 1) ? base_cut(i*(arena_base+1), 2, arena_base-1)
                    : middle_cut(i*(arena_base+1), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]);
        th = slope((i + 0.5)*(arena_base+1)*steps/arena_slope_r); // height of slope
        th2 = (th-1-arena_base/2)/2 - 1;
        t2 = middle_cut((i + 0.5)*(arena_base+1), 0, th2).translate([0, 0, th2 + 1 + 2*arena_base/4]);
        arena_qtr = difference(arena_qtr, t, t2);
    }
    
    arena_qtr =
        intersection(
            arena_qtr,
	        cube({
    			center: [false, false, true],
    			size: [arena_r, arena_r, arena_top*2]
    	    })
		);

	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return arena_qtr;
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
