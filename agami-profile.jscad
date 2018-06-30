//
// Mount attachment for door rails of Agami cupboard
//

function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['gate', 'mount', 'cable_pin', 'pin', 'hook'],
        captions: ['gate', 'mount', 'cable_pin', 'pin', 'hook'],
        initial: 'mount',
        caption: 'Part:'
    }];
}

//
//
//     | <w2> | h2
//  +--+      +--+
//  |    <w1>    | h1
//  +------------+
var width  = 7.05;
var base7  = 65.05;
var base14 = 137.02;
var base_z = 15;
var base_w1 = 5.1;
var base_h1 = 1.1;
var base_w2 = 2.3;
var base_h2 = 1.5;
var base_w3 = 4+base_w2/2;
var base_h3 = 2;
var base_w4 = 2;
var base_h4 = 4+base_h3;
var base_w5 = 10.5+base_w4;
var base_h5 = 2;
var base_w6 = 2;
var base_h6 = 9.5+base_h5;
var base_m = 30; // base margins
var hook_r = 1;
var base_total = ((pin_loc(19)-pin_loc(0))+base_m);
var hook_start = (-base_total+base_m)/2;
var base_hole = 8;

function pin_loc(pos) {
	var y_pos =
		(pos >= 14) ? (base14 + width * (pos-14)) :
		(pos >= 7)  ? (base7  + width * (pos-7)) :
		              (width * pos) ;
	return y_pos;
}

//
// enter wires through hole
//
function hole(r=24) {
	var res =
		cube({
			size: [r, r, base_z],
			center: [true, true, true]})
		.subtract(cylinder({
			r1 : r/2-2,
			r2 : r/2-2,
			start: [0, 0, -base_z],
			end: [0, 0, base_z],
 			center: [true, true, true]}))
		.subtract(cube({
				size: [r/2, r/3, 2*base_z],
				center: [true, true, true]})
			.rotateX(35)
			.translate([1*r/4, 0, 0])
			)
		.translate([r/2, r/2, base_z/2]);
	return res;
}

//
// Hold wires against door
//
function gate(r=12, m=3) {
	var res =
		cube({
			size: [r, r, base_z],
			center: [true, true, true]})
		.subtract(cylinder({
			r1 : r/2-m,
			r2 : r/2-m,
			start: [0, 0, -base_z],
			end: [0, 0, base_z],
 			center: [true, true, true]}))
		.subtract(cube({
				size: [r-2*m, r/2, 2*base_z],
				center: [true, true, true]})
			.translate([0, -r/4, 0])
			)
		.translate([r/2, r/2, base_z/2]);
	return res;
}

//
// Generic mount. Use with specific mount attachment and compatible pin
//
function mount(r=21, r2=15, m=2) {
	var pin_w = r2*Math.sin(360/8/2/(180/3.14159));
	var pin_r = r2/2*Math.cos(360/8/2/(180/3.14159));
	var pin_l = r/2-pin_r;	// cube size with guaranteed margins
	var cs = r+Math.min(m, (r-r2)/2);
	var res =
		cube({
			size: [cs, cs, base_z],
			center: [true, true, true]
		})
		.subtract(cylinder({
			r1 : r2/2,
			r2 : r2/2,
			start: [0, 0, -base_z/2],
			end: [0, 0, base_z/2],
 			center: [true, true, true]}))
		.subtract(cylinder({
			r1 : r2/2+1,
			r2 : r2/2,
			start: [0, 0, -base_z/2],
			end: [0, 0, -base_z/2+1],
 			center: [true, true, true]}))
		.subtract(cylinder({
			r1 : r2/2,
			r2 : r2/2+1,
			start: [0, 0, base_z/2-1],
			end: [0, 0, base_z/2],
 			center: [true, true, true]}))
		.subtract(pin(r, r2))
		.translate([cs/2, cs/2, base_z/2])
		;
	return res;
}

//
// compatible pin for mount() above
//
function pin(r=21, r2=15, fn=8) {
	// size of octagon 
	var fillet_l = 1;
	var pin_w = r2*Math.sin(360/8/2/(180/3.14159));
	var pin_r = r2/2*Math.cos(360/8/2/(180/3.14159));
	var pin_l = r/2-pin_r+fillet_l;
	var cyl_params = {
		r1 : r2/2,
		r2 : r2/2,
		start: [0, 0, -base_z/2+fillet_l],
		end: [0, 0, base_z/2-fillet_l],
		center: [true, true, true]
	};
	if (fn)
		cyl_params.fn = fn;
	var res =
		cylinder(cyl_params);
		.union(cylinder({
			r1 : r2/2-fillet_l,
			r2 : r2/2,
			fn: 8,
			start: [0, 0, -base_z/2],
			end: [0, 0, -base_z/2+fillet_l],
 			center: [true, true, true]}))
		.union(cylinder({
			r1 : r2/2,
			r2 : r2/2-fillet_l,
			fn: 8,
			start: [0, 0, base_z/2-fillet_l],
			end: [0, 0, base_z/2],
 			center: [true, true, true]}))
		.rotateZ(360/8/2)
		.union(cube({
				size: [pin_l, pin_w, base_z],
				center: [true, true, true]})
				.union(cube({
					size: [2, pin_w+4, base_z],
					center: [false, true, true]})
				.translate([pin_l/2, 0, 0])
				)
			.translate([pin_l/2-fillet_l+pin_r, 0, 0]))
		;
	return res;
}

function cable_pin(r=21, r2=15) {
	return pin(r, r2)
		.subtract(
			cube({
				size: [r2-6, r, 2*base_z+1],
				center: [false, true, true]})
			.translate([r/2-r2/2, r/2, 0]))
		;
}

function main(params) {
    var resolutions = [
        [6, 16],
        [8, 24],
        [12, 32],
        [24, 64],
        [48, 128]
    ];
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];


	var base = cube({
		size: [base_w1, base_h1, base_z],
		center: [true, false, false]
	})
	.union(cube({
		size: [base_w2, base_h2, base_z],
		center: [true, false, false]
	}).translate([0, base_h1, 0]))
	.union(cube({
		size: [base_w3, base_h3, base_z],
		center: [false, false, false]
	}).translate([-base_w2/2, base_h1+base_h2, 0]))
	.union(cube({
		size: [base_w4, base_h4, base_z],
		center: [false, false, false]
	}).translate([-base_w2/2+base_w3, base_h1+base_h2+base_h3-base_h4, 0]))
	.union(cube({
		size: [base_w5, base_h5, base_z],
		center: [false, false, false]
	}).translate([-base_w2/2+base_w3, base_h1+base_h2+base_h3-base_h4, 0]))
	.union(cube({
		size: [base_w6, base_h6, base_z],
		center: [false, false, false]
	}).translate([-base_w2/2+base_w3+base_w5-base_w6, base_h1+base_h2+base_h3-base_h4-base_h6, 0]))
	;
	var floor_x = -base_w2/2+base_w3+base_w5-base_w6;
	var floor_y = base_h1+base_h2+base_h3-base_h4-base_h6;
	var handle = cube({
		size: [2, 10, base_z],
		center: [true, false, false]
	}).translate([0, base_h1+base_h2, 0])
	;
	//
	// Render
	//
	switch (params.part) {
		case 'mount':
			return base.union(mount().translate([floor_x, floor_y, 0]));
		case 'gate':
			return base.union(gate().translate([floor_x, floor_y, 0]));
		case 'hook':
			return base.union(hook().translate([floor_x, floor_y, 0]));
		case 'pin':
			return pin();
		case 'cable_pin':
			return cable_pin();
	}
}	
