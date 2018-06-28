//
// Mount for Yi Smart Dash camera
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
        values: ['flat', 'mount', 'camera'],
        captions: ['flat', 'mount', 'camera'],
        initial: 'flat',
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
var base_z = 10;
var base_w1 = 5.1;
var base_w2 = 2.3;
var base_w3 = 4+base_w2/2;
var base_w4 = 2;
var base_h1 = 1.1;
var base_h2 = 1.5;
var base_h3 = 2;
var base_h4 = 4+base_h3;
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
	;
	
	var handle = cube({
		size: [2, 10, base_z],
		center: [true, false, false]
	}).translate([0, base_h1+base_h2, 0])
	;
	//
	// Render
	//
	return base;//.union(handle);//hook.union(hook.translate([0, 10, 0]));
	switch (params.part) {
		case 'flat':
			return base;
	}
}	
