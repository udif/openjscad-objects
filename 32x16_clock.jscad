//
// 32x16 clock
//

nx = 2; // number of modules;

p_x = 64.2;
p_y = 129.7;
o_x = p_x + 5;
o_y = 180;
o_z = 20;

// dimensions of bare PCB
pcb_x = 32.4;
pcb_y = 130;
pcb_z = 1.4
pcb_pins_z = 5.9;
// distance of holes from pcb corner
holes_dx = 6.1;
holes_dy = 3.3;

// internal cavity in front part
front_hole_x = 65;
front_hole_y = 130;

// outer dimensions of front part
front_w = 4;
front_x = front_hole_x + 2*front_w;
front_y = 180; // extra room for cables
front_z = 20;

// build a hex bolt with a cone 
function cone_hex_bolt() {
	return union(
	    cylinder({h: 3, r: 3.3, fn: 6}),
	    cylinder({h:30, r:1.5}),
	    translate([0, 0, 3], cylinder({h:1, r1:3, r2:1.5}))
	);
}

function simple_hex_bolt() {
	return union(
	    cylinder({h: 3, r: 3.3, fn: 6}),
	    cylinder({h:30, r:1.5})
	);
}

function nuts(px, bolt) {
	let x = pcb_x/2 - holes_dx;
	let y = pcb_y/2 - holes_dy;
	let bx = ((nx - 1)/2 - px)*pcb_x
	return union(
		translate([ x+bx,  y, 0], bolt),
		translate([-x+bx,  y, 0], bolt),
		translate([ x+bx, -y, 0], bolt),
		translate([-x+bx, -y, 0], bolt)
	);
}

// This draws a box of [w, d, h] but with 45 degree sides.
// By printing several boxes of this type attached next to each other,
// we can fold them.
// tabs is a mask, controlling which corners and sides gets small tabs to be attached to a wide skirt
// numbering is clockwise:
// 1  2  3
// 8     4
// 7  6  5
function folding_side(w, h, d, mask=15, tabmask=0, malemask=0, femalemask=0, empty = 1) {
	let SQ2 = Math.sqrt(2);
	var e = 0.1;
	l = SQ2 * Math.max(w, h);
	let dw = l / SQ2 - w/2;
	let dh = l / SQ2 - h/2;
	let c = cube({size: [w, h, d], center:[true, true, false]});
	let corner = rotate([0, 0, 45], cylinder({fn:4, r1:l, r2:0, h:l/SQ2, center:[true, true, false]}));
	let no_corner = cube({size: 3*Math.max(w, h), center:[true, true, false]})
	// 3 tabs for attaching the object to the printing surface, horiz, vert and corner
	let tabv = cube({size:[1, 2, 0.2], center:[true, true, false]});
	let tabh = cube({size:[2, 1, 0.2], center:[true, true, false]});
	// if no tabs, make sure tabc is invisible by making it smaller than the box itself
	let tabc = cube({size:(tabmask > 0) ? [2, 2, 0.2] : [w/4, h/4, d/4], center:[true, true, false]});
	// a vertical tab for locking parts together
	// union part
	let tabmu, tabmi;
	// this stops the recursion where we use folding_side itself to generate the teeth for the malemask
	if (malemask > 0) {
		tabmu = union(
			translate([ 1.9/2, 0, d/2], rotate([0,  90, 0], folding_side(d/3-e, d/3-e, 0.4, 7, 0, 0, 0, 0))),
			translate([-1.9/2, 0, d/2], rotate([0, -90, 0], folding_side(d/3-e, d/3-e, 0.4, 7, 0, 0, 0, 0))),
			//translate([ 1.9/2, 0, d/2], rotate([0,  90, 0], cube({size:[d/3-e, d/3-e, 0.4], center:[true, true, false]}))),
			//translate([-1.9/2, 0, d/2], rotate([0, -90, 0], cube({size:[d/3-e, d/3-e, 0.4], center:[true, true, false]}))),
			translate([0, 0.5, 0], cube({size:[1.9,   d-1-e, d-1-e], center:[true, true, false]}))
		);
		// intersection part
		tabmi = translate([0, 0, 1],
			cube({size:[6.4, d, d-1], center:[true, true, false]})
		);
	}
	let tabfi, tabfu;
	if (femalemask > 0) {
		// intersection path for female part of the tab
		tabfi = translate([0, 0, 1],
			cube({size:[6.4, d, d-1], center:[true, true, false]})
		);
		// union part
		tabfu = difference(
			union(
				translate([-2, 0.5, 1], cube({size:[2, d-1-e, d-1-e], center:[true, true, false]})),
				translate([ 2, 0.5, 1], cube({size:[2, d-1-e, d-1-e], center:[true, true, false]}))
			),
			translate([ 0, 0, d/2], cube({size:[3, d/3, d/3], center:[true, true, true]}))
		);
	}
	var tabs = union(
		(malemask &  1) ? translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabmu)) : tabc,
		(malemask &  2) ? translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabmu)) : tabc,
		(malemask &  4) ? translate([0/2,  h/2-d/2,  0], rotate([0, 0, 180], tabmu)) : tabc,
		(malemask &  8) ? translate([0/2, -h/2+d/2,  0], tabmu) : tabc,

		(femalemask &  1) ? translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabfu)) : tabc,
		(femalemask &  2) ? translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabfu)) : tabc,
		(femalemask &  4) ? translate([0/2,  h/2-d/2,  0], rotate([0, 0, 180], tabfu)) : tabc,
		(femalemask &  8) ? translate([0/2, -h/2+d/2,  0], tabfu) : tabc,

		(tabmask &   1) ? translate([-w/2, -h/2 ,0], tabc) : tabc,
		(tabmask &   2) ? translate([-w/2,  0/2, 0], tabh) : tabc,
		(tabmask &   4) ? translate([-w/2,  h/2, 0], tabc) : tabc,
		(tabmask &   8) ? translate([ 0/2,  h/2, 0], tabv) : tabc,
		(tabmask &  16) ? translate([ w/2,  h/2, 0], tabc) : tabc,
		(tabmask &  32) ? translate([ w/2,  0/2, 0], tabh) : tabc,
		(tabmask &  64) ? translate([ w/2, -h/2, 0], tabc) : tabc,
		(tabmask & 128) ? translate([ 0/2, -h/2, 0], tabv) : tabc
	);
	//return translate([0, 0, 1], cube({size: [w-2*d-1, h-2*d-1, d - 1], center:[true, true, false]}));
	return union(
		intersection (
			translate([ dw,0 ,0], (mask & 1) ? corner : no_corner),
			translate([-dw,0 ,0], (mask & 2) ? corner : no_corner),
			translate([0,  dh,0], (mask & 4) ? corner : no_corner),
			translate([0, -dh,0], (mask & 8) ? corner : no_corner),
    		(femalemask &  1) ? difference(c, translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabfi))) : c,
    		(femalemask &  2) ? difference(c, translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabfi))) : c,
    		(femalemask &  4) ? difference(c, translate([0/2,  h/2-d/2,  0], rotate([0, 0, 180], tabfi))) : c,
    		(femalemask &  8) ? difference(c, translate([0/2, -h/2+d/2,  0], tabfi)) : c,
    		(malemask &  1)   ? difference(c, translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabmi))) : c,
    		(malemask &  2)   ? difference(c, translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabmi))) : c,
    		(malemask &  4)   ? difference(c, translate([0/2,  h/2-d/2,  0], rotate([0, 0, 180], tabmi))) : c,
    		(malemask &  8)   ? difference(c, translate([0/2, -h/2+d/2,  0], tabmi)) : c,
			empty ? difference(c, translate([0, 0, 1], cube({size: [w-2*d-1, h-2*d-1, d], center:[true, true, false]}))) : c,
			c
		),
		tabs
	);
		
}

function front() {
	//b = translate([0,0,11.65+pcb_z+6], simple_hex_bolt().rotateX(180))
	let l = lock_slot(pcb_y+6).rotateX(-90).rotateY(-90)
	let lb = l.getBounds()
	return difference(
		// front box
		union(
			folding_side(front_x, front_y, front_w, 15, 0, 14, 1),
			translate([       0, 0, 1 - lb[0].z], l),
			translate([ pcb_x*.85, 0, 1 - lb[0].z], l),
			translate([-pcb_x*.85, 0, 1 - lb[0].z], l)
			//cube({size:[front_hole_x, front_hole_y + 10, 11.65+pcb_z+6], center:[true, true, false]})
		),
		// front cavity
		cube({size:[front_hole_x, front_hole_y, 11.65 + pcb_z], center:[true, true, false]})
		//cube({size:[front_hole_x, front_hole_y - 26, 20], center:[true, true, false]}),
		//translate([0, 0, front_w],
		//	cube({size:[front_hole_x - 18, front_hole_y +10, 11.65 - front_w], center:[true, true, false]})),
		//translate([0, 0, (pcb_pins_z-pcb_z)], cube({
		//	size:[front_hole_x, front_y-front_w,
		//	front_z-(pcb_pins_z-pcb_z)],
		//	center:[true, true, false]}))
		//nuts(1, b),
		//nuts(0, b)
	);
}

function cover() {
	return folding_side(o_x, o_y, o_z, 4);
	return difference(
		cube({size:[o_x, o_y, o_z], center:[true, true, false]}),
		cube({size:[p_x, p_y, 20], center:[true, true, false]}),
		translate([0, 0, 2], cube({size:[o_x-5, o_y-5, o_z-2], center:[true, true, false]}))
	);
}

function back() {
	return difference(
		cube({size:[o_x, o_y, o_z], center:[true, true, false]}),
		cube({size:[p_x, p_y, 20], center:[true, true, false]}),
		translate([0, 0, 2], cube({size:[o_x-5, o_y-5, o_z-2], center:[true, true, false]}))
	);
}

function lock_slot (l) {
	return intersection(
		translate([2, 0, 0], cube({size:[5, 5, l], center:[true, true, true]}).rotateZ(45)),
		cube({size:[10, 10, l+1], center:[false, true, true]})
	)
}
function board_tabs() {
	tab_l = 2+pcb_z+11.65
	tab_b = 2 // tab_base
	lock_d = 3 // lock depth
	return difference(
		union(
			// main piece
			cube({size:[2*pcb_x, tab_l, 6+tab_b+lock_d], center:[true, false, false]}),
			// side supports, should be located inside the cavities in the side panels
			cube({size:[4+2*pcb_x, 5, 6+tab_b+lock_d], center:[true, false, false]})
		),
		// slot for pcb
		translate([0, 2, tab_b+lock_d], cube({size:[2*pcb_x, pcb_z, 10], center:[true, false, false]})),
		// cutout for the module itself
		translate([0, 2+pcb_z+4, tab_b+lock_d], cube({size:[2+2*pcb_x, tab_l, 10], center:[true, false, false]})),
		// cutout for wires
		translate([ pcb_x/2, 0, tab_b+lock_d], cube({size:[pcb_x-2*9.5, 2+pcb_z+6, 10], center:[true, false, false]})),
		translate([-pcb_x/2, 0, tab_b+lock_d], cube({size:[pcb_x-2*9.5, 2+pcb_z+6, 10], center:[true, false, false]})),
		translate([ pcb_x/2, 2+pcb_z, 0], cube({size:[pcb_x-2*9.5, 6, 10], center:[true, false, false]})),
		translate([-pcb_x/2, 2+pcb_z, 0], cube({size:[pcb_x-2*9.5, 6, 10], center:[true, false, false]})),
		// tabs connecting to main box
		translate([         0, tab_l-2, tab_b], cube({size:[5, 5, 20], center:[true, true, false]}).rotateZ(45)),
		translate([-pcb_x*.85, tab_l-2, tab_b], cube({size:[5, 5, 20], center:[true, true, false]}).rotateZ(45)),
		translate([ pcb_x*.85, tab_l-2, tab_b], cube({size:[5, 5, 20], center:[true, true, false]}).rotateZ(45))
	)
}

function main(params) {
	//return lock_slot().rotateY(-90)
	return board_tabs()
	// last printed was 130x64 !!
	panel = difference(
			cube({size:[pcb_x, pcb_y, 2], center:[true, true, false]}),
			translate([-(pcb_x/2 - holes_dx),  (pcb_y/2 - holes_dy), 0], cylinder({h:10, r:3/2, center:[true, true, false]})),
			translate([-(pcb_x/2 - holes_dx), -(pcb_y/2 - holes_dy), 0], cylinder({h:10, r:3/2, center:[true, true, false]})),
			translate([ (pcb_x/2 - holes_dx),  (pcb_y/2 - holes_dy), 0], cylinder({h:10, r:3/2, center:[true, true, false]})),
			translate([ (pcb_x/2 - holes_dx), -(pcb_y/2 - holes_dy), 0], cylinder({h:10, r:3/2, center:[true, true, false]}))
		);
	//return union(panel, translate([pcb_x, 0, 0], panel));
	console.log(cube({size:1}));
	let x = 20;
	if (1) {
	return union(
		translate([0, 0, 0], front()),
		translate([-(front_x+front_z)/2, 0, 0], folding_side(front_z, front_y, front_w, 15, 0, 2, 1)),
		translate([-(front_x+front_z), 0, 0], folding_side(front_x, front_y, front_w, 15, 5, 2, 13)),
		translate([(front_x+front_z)/2, 0, 0], folding_side(front_z, front_y, front_w, 15, 80, 2, 1)),
		translate([0, (front_y + front_z)/2, 0], folding_side(front_x, front_z, front_w, 15, 20, 4, 8)),
		translate([0, -(front_y + front_z)/2, 0], folding_side(front_x, front_z, front_w, 15, 65, 8, 4)),
		// This cross makes sure all 6 sides are fully connected at height 0
		intersection(union(
			translate([-front_x/2, 0, 0], folding_side((front_x+front_z)*2, front_y, 0.2)),
			translate([0, 0, 0], folding_side(front_x, (front_y + 2*front_z), 0.2))), front())
	);
	}
	return union(
		translate([o_x+5, 0, 0], front()),
		translate([-o_x-5, 0, 0], back()),
		cover()
	);
}

/*
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
		var t = linear_extrude({height:10},	polygon({points: points}));

		return 	union(
			mirror([0, 0, 1], t.rotateX(-90)),
			t.rotateX(90).rotateZ(90)
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
    for (i = 1; (arena_pos(i) < arena_r - arena_cut - arena_base); i++) {
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
		pin_height = (arena_base-3)/2;
		    return intersection(
		        translate([100, 0, 0], cube({size:[40, 40, 2*(pin_height-0.6)], center:true})),
			    scale([1, 1.5, 1], middle_cut(100, 2, pin_height-0.2))
			);
	}
}	
*/
