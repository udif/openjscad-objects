include ('jscad-utils.jscad')
include ('jscad-utils-color.jscad')
include ('jscad-utils-parts.jscad')

function getParameterDefinitions() {

    return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 2,
        caption: 'Resolution:'
    }];
}

function main() {
    var resolutions = [
        [6, 16],
        [8, 24],
        [12, 32],
        [24, 64],
        [48, 128]
    ];
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];
	util.init(CSG);

    var cyl1 = CSG.cylinder({ start: [0, 0, 0], end: [0, 0, 2], radius: 40/2});

	var cyl2 = CSG.cylinder({ start: [0, 0, 2], end: [0, 0, 2+19], radius: 35/2})
        //.align(cyl1, 'z+')
        .fillet(-2, 'z+')
        .fillet(-2, 'z-'); // fillet on the bottom (negative fillet)

	var cyl3 = CSG.cylinder({ start: [0, 0, 2+19], end: [0, 0, 2+19+2], radius: 40/2});

    return union(cyl1, cyl2, cyl3);
}