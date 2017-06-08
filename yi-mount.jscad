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

	var base_z = 2.2
	var base_stop_z = 4.5
	var axis_height = 7
	var base = CSG.cube({
			center: [0,0,0],
			radius: [17.5/2,36/2,base_z/2]
		}).rotateX(270).chamfer(0.5, 'z+').rotateX(90);
	var base_stop = CSG.cube({
			center: [0,0,0],
			radius: [24/2,2/2,base_stop_z/2]
		});
	var axis = CSG.cube({
			center: [0,0,0],
			radius: [10/2,2/2,axis_height/2]
		});
	var axis_stop = CSG.cube({
			center: [0,0,0],
			radius: [2/2,7.7/2,axis_height/2]
		});
	var base_stiffner = CSG.cube({
			center: [0,0,0],
			radius: [2/2,36/2,2/2]
		});
	var axis_plus_stop = axis.union(axis_stop.snap(axis, 'x', 'outside-'))
	                         .union(base_stiffner.snap(axis, 'x', 'outside-').translate([0,0,-(axis_height-2)/2]))
	                         .union(base_stiffner.snap(axis, 'x', 'outside+').translate([0,0,-(axis_height-2)/2]));
	var yi = CSG.cube({
			center: [0,0,0],
			radius: [7.7/2,2/2,10/2]
		}).chamfer(0.5, 'z+').rotateX(90).rotateZ(-90);//.chamfer(0.5, 'z+').rotateX(180);
	var base_axis  = base.union([
		axis_plus_stop.snap(base, 'z', 'outside-'),
		base_stop.snap(base, 'y', 'outside-').translate([0,0,(base_stop_z-base_z)/2])
	]);
	var base_axis_yi = base_axis.union(yi.snap(base_axis, 'z', 'inside+'));
	
	return base_axis_yi
}	
