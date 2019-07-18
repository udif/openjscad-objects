//
// demo of folding box
//

// This draws a box of [w, d, h] but with 45 degree sides.
// By printing several boxes of this type attached next to each other,
// we can fold them.
// tabs is a mask, controlling which corners and sides gets small tabs to be attached to a wide skirt
// numbering is clockwise:
// 1  2  3
// 8     4
// 7  6  5
function folding_side(w, h, d, mask=15, tabmask=0, malemask=0, femalemask=0) {
	let SQ2 = Math.sqrt(2);
	var e = 0.1;
	var w1 = w / SQ2;
	var h1 = h / SQ2;
	l = 2 * Math.max(w1, h1);
	var c = cube({size: [w, h, d], center:[true, true, false]});
	var corner = rotate([0, 0, 45], cylinder({fn:4, r1:l, r2:0, h:l/SQ2, center:[true, true, false]}));
	var no_corner = cube({size: 3*Math.max(w, h), center:[true, true, false]})
	// 3 tabs for attaching the object to the printing surface, horiz, vert and corner
	var tabv = cube({size:[1, 2, 0.2], center:[true, true, false]});
	var tabh = cube({size:[2, 1, 0.2], center:[true, true, false]});
	var tabc = cube({size:[2, 2, 0.2], center:[true, true, false]});
	// a vertical tab for locking parts together
	var tabmv = cube({size:[1.9,   d-1-e, d-1-e], center:[true, true, false]});
	var tabmh = cube({size:[d-1-e, 1.9,   d-1-e], center:[true, true, false]});
	var tabfv = translate([0, 0, 1], cube({size:[2, d, d-1], center:[true, true, false]}));
	var tabfh = translate([0, 0, 1], cube({size:[d, 2, d-1], center:[true, true, false]}));
	var tabs = union(
		(malemask &  1) ? translate([-w/2+d/2,  0/2, 0], tabmh) : tabc,
		(malemask &  2) ? translate([ w/2-d/2,  0/2, 0], tabmh) : tabc,
		(malemask &  4) ? translate([0/2,  w/2-d/2,  0], tabmv) : tabc,
		(malemask &  8) ? translate([0/2, -w/2+d/2,  0], tabmv) : tabc,

		(tabmask &   1) ? translate([-w/2, -h/2 ,0], tabc) : tabc,
		(tabmask &   2) ? translate([-w/2,  0/2, 0], tabh) : tabc,
		(tabmask &   4) ? translate([-w/2,  h/2, 0], tabc) : tabc,
		(tabmask &   8) ? translate([ 0/2,  h/2, 0], tabv) : tabc,
		(tabmask &  16) ? translate([ w/2,  h/2, 0], tabc) : tabc,
		(tabmask &  32) ? translate([ w/2,  0/2, 0], tabh) : tabc,
		(tabmask &  64) ? translate([ w/2, -h/2, 0], tabc) : tabc,
		(tabmask & 128) ? translate([ 0/2, -h/2, 0], tabv) : tabc
	);
	var dw = l / SQ2 - w/2;
	var dh = l / SQ2 - h/2;
	return union(
		intersection (
			translate([ dw,0 ,0], (mask & 1) ? corner : no_corner),
			translate([-dw,0 ,0], (mask & 2) ? corner : no_corner),
			translate([0,  dh,0], (mask & 4) ? corner : no_corner),
			translate([0, -dh,0], (mask & 8) ? corner : no_corner),
    		(femalemask &  1) ? difference(c, translate([-w/2+d/2,  0/2, 0], tabfh)) : c,
    		(femalemask &  2) ? difference(c, translate([ w/2-d/2,  0/2, 0], tabfh)) : c,
    		(femalemask &  4) ? difference(c, translate([0/2,  w/2-d/2,  0], tabfv)) : c,
    		(femalemask &  8) ? difference(c, translate([0/2, -w/2+d/2,  0], tabfv)) : c,
			c
		),
		tabs
	);
		
}

function main(params) {
	let x = 20;
	return union(
		translate([0, 0, 0], folding_side(x, x, 5, 15, 80, 2)),
		translate([-x, 0, 0], folding_side(x, x, 5, 15, 0)),
		translate([-2*x, 0, 0], folding_side(x, x, 5, 15, 0)),
		translate([-3*x, 0, 0], folding_side(x, x, 5, 15, 5, 0, 1)),
		translate([-x, x, 0], folding_side(x, x, 5, 15, 20, 4)),
		translate([-x, -x, 0], folding_side(x, x, 5, 15, 65, 0, 8)),
		// This cross makes sure all 6 sides are fully connected at height 0
		translate([-1.5*x, 0, 0], cube({size:[4*x, x, 0.2], center:[true, true, false]})),
		translate([-x, 0, 0], cube({size:[x, 3*x, 0.2], center:[true, true, false]}))
	);
}
