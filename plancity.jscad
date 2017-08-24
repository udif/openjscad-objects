//
// Playing piece for Othello (half piece)
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
        values: ['piece', 'piece_with_slot'],
        captions: ['piece',  'piece with middle slot'],
        initial: 'piece_flat',
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

    // Radius of part
	var small_r = 12.5/2;
    // Radius of part
	var large_r = 13.5/2;
	// Height of part
	var height = 9.8;
	// Height of connecting neck
	var width = 6;
	// width of slot
	var slot_width=1;
	// Max Depth of curve in the middle
	var length=36;

	var large_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, height],
			radius: large_r
		});
	var small_cyl_offset = length -small_r - large_r;
	var small_cyl = CSG.cylinder({
			start: [small_cyl_offset,0,0],
			end: [small_cyl_offset, 0, height],
			radius: small_r
		});
	var connect = CSG.cube({
			center: [small_cyl_offset/2,0,height/2],
			radius: [small_cyl_offset/2,width/2,height/2]
		});
	var slot = CSG.cube({
			center: [0,0,height/2],
			radius: [large_r,slot_width/2,height/2]
		});

	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return union(large_cyl, small_cyl, connect);
			
		case 'piece_with_slot':
			return union(large_cyl, small_cyl, connect).subtract(slot);
	}
}	
