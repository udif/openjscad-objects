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

	function base_cut(r, w, h) {
		var points;
		if (w < 0.001) {
			points = [[r+h, 0], [r, h], [r-h, 0]];
		} else {
			points = [[r+h+w/2, 0], [r+w/2, h], [r-w/2, h], [r-h-w/2, 0]];
		}
		return polygon_cut(points);
	}

	function middle_cut(r, w, h) {
		points = [
			[r+h, 0], [r, h], [r-h, 0],
			[r-w/2, -h+w/2], [r+w/2, -h+w/2]
		];
		return polygon_cut(points);
	}

	function polygon_cut(points) {
		return 	union(
			rotate_extrude(
				{fn:16, startAngle:270, angle:90/8},
				polygon({points: points})),
			rotate_extrude(
				{fn:16, startAngle:360-90/8, angle:90/8},
				polygon({points: points}))
		);
	}

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
		if ((i & 1) == 0){
			t = middle_cut(arena_pos(i), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]);
			th = slope(arena_pos(i + 0.5)/arena_slope_r); // height of slope
			arena_qtr = difference(arena_qtr, t);
		}
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

		case 'connecting_pin':
			return intersection(
		        middle_cut((arena_base+1), 2, (arena_base-3)/2).translate([0, 0, arena_base/2]),
		        rotate_extrude({fn:16, startAngle: -45/2, angle: 45}, polygon([
		            [0, 0], [arena_slope_r, 0], [arena_slope_r, arena_base], [0, arena_base]]))
		        );
	}
}	
