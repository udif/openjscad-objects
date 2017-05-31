//
// Mount for Yi Smart Dash camera
//
include ('jscad-utils.jscad')
include ('jscad-utils-color.jscad')
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
    util.init(CSG);

	var base = CSG.cube({
			center: [0,0,0],
			radius: [17,36,2]
		});
	var axis = CSG.cube({
			center: [0,0,0],
			radius: [10,2,10]
		});
	var yi = CSG.cube({
			center: [0,0,0],
			radius: [10,7.7,2]
		});
	var base_axis  = base.union(axis.snap(base, 'z', 'outside-'));
	var base_axis_yi = base_axis.union(yi.snap(base_axis, 'z', 'outside-'));
	
	return base_axis_yi
}	
