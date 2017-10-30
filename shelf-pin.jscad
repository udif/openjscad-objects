//
// Pin holding shelve
//
//include ('jscad-utils.jscad')
//include ('jscad-utils-color.jscad')
function getParameterDefinitions() {
	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4, 5],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)',
		'ultra high (96,256)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['piece'],
        captions: ['piece'],
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
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];
    //util.init(CSG);

    // Radius of small pin
	var small_r = 4.92/2;
	// Length of pin
	var small_height = 7.92;
    // Radius of part outside
	var large_r = 7.92/2;
	// Length of outside part
	var total_height = 15.92;
	// Height of connecting neck
	var width = 6.5;
	// width of slot
	var slot_width=1;
	// Max Depth of curve in the middle
	var length=36;

	var small_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, small_height],
			radius: small_r
		});
	var large_cyl = CSG.cylinder({
			start: [0,0,small_height],
			end: [0, 0, total_height-large_r],
			radius: large_r
		});
	var half_dome = CSG.sphere({
		center: [0, 0, total_height-large_r],
		radius: large_r
	});


	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return union(large_cyl, small_cyl, half_dome);
	}

}	