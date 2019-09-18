//
// Cellphone adapter
//


function rounded_cube_edge(l, r, fn) {
	return translate([-r/2, -r/2, -l/2], difference(
		cube({size:[r, r, l]}),
		cylinder({r:r, h:l, fn:fn})
	));
}

function rounded_cube_corner(r, fn) {
	return translate([-r/2, -r/2, -r/2], difference(
		cube({size:r}),
		sphere({r:r, fn:fn})
	));
}

//
// Rounded cube
//
function rcube(s) {
	if ('center' in s) {
		if (s.center.constructor !== Array) {
			s.center = [s.center, s.center, s.center];
		}
	} else {
		s.center = [true, true, true];
	}
	cent = s.center;
	s.center = true;

	if (s.size.constructor !== Array) {
		s.size = [s.size, s.size, s.size];
	}
	if (!('fn' in s)) {
		s.fn = 8;
	}
	if (!('roundradius' in s)) {
		s.roundradius = 1;
	}
	r = s.roundradius;
	// Point
	c = rounded_cube_corner(s.roundradius, s.fn);
	// X Axis
	cx = union(
		translate([-(s.size[0]/2-r/2), 0, 0], mirror([1, 0, 0], c)),
		translate([ (s.size[0]/2-r/2), 0, 0], c)
	);
	// Y Axis
	cxy = union(
		translate([0, -(s.size[1]/2-r/2), 0], mirror([0, 1, 0], cx)),
		translate([0,  (s.size[1]/2-r/2), 0], cx)
	);
	// Z Axis
	cxyz = union(
		translate([0, 0, -(s.size[2]/2-r/2)], mirror([0, 0, 1], cxy)),
		translate([0, 0,  (s.size[2]/2-r/2)], cxy)
	);
	// X Edge
	ex__ = rounded_cube_edge(s.size[0], r, s.fn).rotateY(90);
	ex_ = union(
		translate([0,  (s.size[1]/2-r/2), 0], ex__),
		translate([0, -(s.size[1]/2-r/2), 0], mirror([0, 1, 0], ex__))
	);
	ex = union(
		translate([0, 0,  (s.size[2]/2-r/2)], mirror([0, 0, 1], ex_)),
		translate([0, 0, -(s.size[2]/2-r/2)], ex_)
	);

	// Y Edge
	ey__ = rounded_cube_edge(s.size[1], r, s.fn).rotateX(90);
	ey_ = union(
		translate([ (s.size[0]/2-r/2), 0, 0], ey__),
		translate([-(s.size[0]/2-r/2), 0, 0], mirror([1, 0, 0], ey__))
	);
	ey = union(
		translate([0, 0,  (s.size[2]/2-r/2)], ey_),
		translate([0, 0, -(s.size[2]/2-r/2)], mirror([0, 0, 1], ey_))
	);

	// Z Edge
	ez__ = rounded_cube_edge(s.size[2], r, s.fn);
	ez_ = union(
		translate([ (s.size[0]/2-r/2), 0, 0], ez__),
		translate([-(s.size[0]/2-r/2), 0, 0], mirror([1, 0, 0], ez__))
	);
	ez = union(
		translate([0,  (s.size[1]/2-r/2), 0], ez_),
		translate([0, -(s.size[1]/2-r/2), 0], mirror([0, 1, 0], ez_))
	);

	ccube = difference(
		cube(s),
		cxyz,
		ex,
		ey,
		ez
	);

	return translate([cent[0] ? 0 : s.size[0]/2,
	                  cent[1] ? 0 : s.size[1]/2,
	                  cent[2] ? 0 : s.size[2]/2], ccube);
}

function main(params) {
	let w = 95; // overall width
	let h = 135; // overall height
	let d = 40; // overall depth
	let w1 = 5; // left & right track width
	let w2 = 5;
	let w3 = 5;
	let h1 = 5; // shelf height
	let d1 = 5; // outer shell depth
	let d2 = 15; // shelf depth
	let d3 = 30; // pocket height
	let d4 = 20; // track depth
	let rr = 1;
	let fn = 64;
	
	return difference(
		// outer box, from which we begin to cut out parts
		union(
			rcube({fn:fn, size:[w, h, d4], center:[true, false, false], roundradius:rr}),
			rcube({fn:fn, size:[w-2*w1, h, d], center:[true, false, false], roundradius:rr})
		),
		// cut out internal pocket for phone
		translate([0, h1, d1], rcube({fn:fn, size:[w-2*(w1+w2), h, d3], roundradius:rr, center:[true, false, false]})),
		// cut out front opening
		translate([0, 0, (d1+d2)], cube({size:[w-2*(w1+w2+w3), h, d - (d1 + d2)], roundradius:rr, center:[true, false, false]}))
	);
}
