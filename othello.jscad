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

	var r = 27.8507;
	var base_r = 25/2;
	var base_height = 5.1/2;
	var base = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, base_height],
			radius: base_r
		}); //.rotateX(270).chamfer(0.5, 'z+').rotateX(90);
	var sphere_cut = CSG.sphere({
			center: [0, 0, r+base_height-1.8],
			radius: r
		});
	var piece = base.subtract(sphere_cut);
	return piece;
}	
