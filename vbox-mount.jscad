//
// Mount for VBox TV smart gateway
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

var width  = 7.05;
var base7  = 65.05;
var base14 = 137.02;
var base_z = 4;
var base_m = 30; // base margins
var hook_r = 1;
var base_total = ((pin_loc(19)-pin_loc(0))+base_m);
var hook_start = (-base_total+base_m)/2;
var hook_r = 1;
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

	const base_w = (params.part == 'flat') ? 15 : 10;
	const hook_dz = (params.part == 'flat') ? base_z*sqrt(2)+10 : 3;

	const hole = cylinder({
		start: [ 0, 0, 0],
		end:   [0, 0, 4],
		r1: 2,
		r2: 4});

	var base = difference (
        cube({
        	size: [base_w, base_total, base_z],
        	center: [false, true, false]
		}),
		hole.translate([base_w/2+2, -(base_total/2 - base_hole), 0]),
		hole.translate([base_w/2+2,  (base_total/2 - base_hole), 0])
    ).rotateY(-135);
	

    const hook = difference(cylinder({
        h: hook_dz,
		r: hook_r}).translate([hook_r, 0, 0]).rotateY(45), 
		cube({size:2*sqrt(2)*hook_r, center:true}). translate([hook_r*sqrt(2), 0, -sqrt(2)*hook_r])
	).rotateY(-135);
	console.log("start");
	console.log(hook_start);
	for (i = 0; i <= 19; i++) {
		base = union(base, hook.translate([0, hook_start+pin_loc(i), 0]));
	}
	base = difference(base, cube({size: [hook_dz, base_total, base_z]}).translate([-hook_dz, -base_total/2, -base_z+0.2]));
	//
	// Render
	//
	//return base;//hook.union(hook.translate([0, 10, 0]));
	switch (params.part) {
		case 'flat':
			return base;
	}
}	
