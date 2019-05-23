//
// Beyblade rink, V2
//

function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'int',
        initial: 48,
        caption: 'Number of divisions of a circle:'
    }, {
        name: 'layer_h',
        type: 'float',
        initial: 1,
        caption: 'Layer thickness:'
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
        values: ['piece', 'connecting_pin'],
        captions: ['piece',  'connecting pin'],
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

function vertical_cut(r1, h1, r2, h2, r3, h3) {
    return 	rotate_extrude({fn:16}, polygon({points: [[r1,h1], [r2, h2], [r3, h3]]})).rotateZ(360/32);
}

function middle_cut(r, w, h) {
    var c1 = base_cut(r, 0, h+w/2);
    var c2 = base_cut(r, w, h).rotateX(180);
    return union(c1, c2);
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
	var arena_base = notch_r*2;
	const arena_cut = 10;
	const steps = (arena_top-arena_base)/params.layer_h;

    //
    // arena desired slope, x in the normalized range [0,1], 0 being the center and 1 being the edge
    //
    function slope(x) {
        return arena_base + arena_slope_d*x + ((arena_top-arena_base-arena_slope_d)/(101-x*100));
        //return arena_base + arena_slope_d*i/steps + ((arena_top-arena_base-arena_slope_d)/(steps+1-i));
    }

    // given seartch range[l, h] and expected y, return the desired x
    function inv_slope(l, h, y) {
        var mid=(l+h)/2;
        if ((h-l) < 0.0001) {
            return (h+l)/2;
        }
        if (slope(mid) < y) {
            return inv_slope(mid, h, y);
        } else {
            return inv_slope(l, mid, y);
        }
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
    
	function arena_pos(i) {
		return (3+i*(arena_base+1));
	}
	
			
	var points = Array(steps+4);
	var t, th, th2;
	points[0] = [0, arena_base];
    var last_x = 0;
    var x;
    for (i = 1; i <= steps; i++) {
        x = inv_slope(last_x/arena_slope_r, 1, arena_base+i/steps*(arena_top-arena_base));
	    points[i] = [x*arena_slope_r
	    , arena_base+i*(arena_top-arena_base)/steps];
	    last_x = x;
	}
	points[steps+1] = [arena_r, arena_top];
	points[steps+2] = [arena_r, 0];
	points[steps+3] = [0, 0];
	arena_qtr1 = rotate_extrude({fn:fn}, polygon({points: points}));
    arena_qtr2 = cylinder({h:arena_top, r1:arena_r - arena_cut, r2:arena_r});
	var arena_qtr = intersection(arena_qtr1, arena_qtr2);
    for (i = 1; (arena_pos(i) < arena_r - arena_cut - 1); i++) {
        t = (i & 1) ? base_cut(arena_pos(i), 0, arena_base)
                    : middle_cut(arena_pos(i), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]);
        th = slope(arena_pos(i + 0.5)/arena_slope_r); // height of slope
        th2 = Math.min(arena_base+1, (th-arena_base/2))/2-1;
        // for i == 14 we do an ugly patch because the steep slope somehow produces a hole too big
        if (arena_pos(i+1) > arena_r - arena_cut - 1) {
            t2 = vertical_cut(
                arena_r - arena_cut + 0.5, (arena_r - arena_cut + 3) - arena_pos(i),
                arena_r - arena_cut + 2*arena_base/arena_top*arena_cut - 1.5,
                1.5 * arena_base + 9, // 8,15 are fudged to fit current parameters
                arena_pos(i - 0.5) + 1.5, 1.5 * arena_base + 0.5);
        } else {
            t2 = middle_cut(arena_pos(i + 0.5), 0, th2).translate([0, 0, th2 + 1 + 2*arena_base/4]);
        }
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
			return difference(
				union(
					arena_qtr,
					rotate_extrude(
						{fn:16, startAngle:270+90/8, angle:90*3/4},
						square({size:[arena_r - arena_cut, arena_base], center:false}))
				),
				cube({size:[arena_r - arena_cut, 0.2, arena_base], center:false}).rotateZ(3*90/8),
				cube({size:[arena_r - arena_cut, 0.2, arena_base], center:false}).rotateZ(5*90/8)
			);

			return arena_qtr;
		case 'connecting_pin':
			return intersection(
		        middle_cut((arena_base+1), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]),
		        rotate_extrude({fn:16, startAngle: -45/2, angle: 45}, polygon([
		            [0, 0], [arena_slope_r, 0], [arena_slope_r, arena_base], [0, arena_base]]))
		        );
	}
}	
