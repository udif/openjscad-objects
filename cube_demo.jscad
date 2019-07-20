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
			translate([ 1.9/2, 0, d/2], rotate([0,  90, 0], folding_side(d/3-e, d/3-e, 0.4, 7, 0))),
			translate([-1.9/2, 0, d/2], rotate([0, -90, 0], folding_side(d/3-e, d/3-e, 0.4, 7, 0))),
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
		(malemask &  4) ? translate([0/2,  w/2-d/2,  0], rotate([0, 0, 180], tabmu)) : tabc,
		(malemask &  8) ? translate([0/2, -w/2+d/2,  0], tabmu) : tabc,

		(femalemask &  1) ? translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabfu)) : tabc,
		(femalemask &  2) ? translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabfu)) : tabc,
		(femalemask &  4) ? translate([0/2,  w/2-d/2,  0], rotate([0, 0, 180], tabfu)) : tabc,
		(femalemask &  8) ? translate([0/2, -w/2+d/2,  0], tabfu) : tabc,

		(tabmask &   1) ? translate([-w/2, -h/2 ,0], tabc) : tabc,
		(tabmask &   2) ? translate([-w/2,  0/2, 0], tabh) : tabc,
		(tabmask &   4) ? translate([-w/2,  h/2, 0], tabc) : tabc,
		(tabmask &   8) ? translate([ 0/2,  h/2, 0], tabv) : tabc,
		(tabmask &  16) ? translate([ w/2,  h/2, 0], tabc) : tabc,
		(tabmask &  32) ? translate([ w/2,  0/2, 0], tabh) : tabc,
		(tabmask &  64) ? translate([ w/2, -h/2, 0], tabc) : tabc,
		(tabmask & 128) ? translate([ 0/2, -h/2, 0], tabv) : tabc
	);

	return union(
		intersection (
			translate([ dw,0 ,0], (mask & 1) ? corner : no_corner),
			translate([-dw,0 ,0], (mask & 2) ? corner : no_corner),
			translate([0,  dh,0], (mask & 4) ? corner : no_corner),
			translate([0, -dh,0], (mask & 8) ? corner : no_corner),
    		(femalemask &  1) ? difference(c, translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabfi))) : c,
    		(femalemask &  2) ? difference(c, translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabfi))) : c,
    		(femalemask &  4) ? difference(c, translate([0/2,  w/2-d/2,  0], rotate([0, 0, 180], tabfi))) : c,
    		(femalemask &  8) ? difference(c, translate([0/2, -w/2+d/2,  0], tabfi)) : c,
    		(malemask &  1)   ? difference(c, translate([-w/2+d/2,  0/2, 0], rotate([0, 0, 270], tabmi))) : c,
    		(malemask &  2)   ? difference(c, translate([ w/2-d/2,  0/2, 0], rotate([0, 0, 90],  tabmi))) : c,
    		(malemask &  4)   ? difference(c, translate([0/2,  w/2-d/2,  0], rotate([0, 0, 180], tabmi))) : c,
    		(malemask &  8)   ? difference(c, translate([0/2, -w/2+d/2,  0], tabmi)) : c,
			c
		),
		tabs
	);
		
}

function main(params) {
	let x = 20;
	if (0) {
		return union(
			translate([0, 0, 0], folding_side(x, x, 5, 15, 80, 2)),
			translate([x/2+5, 0, x/2], rotate([0, -90, 0], folding_side(x, x, 5, 15, 5, 0, 13)))
		);
	};
	return union(
		translate([0, 0, 0], folding_side(x, x, 5, 15, 80, 2, 1)),
		translate([-x, 0, 0], folding_side(x, x, 5, 15, 0, 2, 1)),
		translate([-2*x, 0, 0], folding_side(x, x, 5, 15, 0, 2, 1)),
		translate([-3*x, 0, 0], folding_side(x, x, 5, 15, 5, 2, 13)),
		translate([-x, x, 0], folding_side(x, x, 5, 15, 20, 4)),
		translate([-x, -x, 0], folding_side(x, x, 5, 15, 65, 8)),
		// This cross makes sure all 6 sides are fully connected at height 0
		translate([-1.5*x, 0, 0], cube({size:[4*x, x, 0.2], center:[true, true, false]})),
		translate([-x, 0, 0], cube({size:[x, 3*x, 0.2], center:[true, true, false]}))
	);
}
