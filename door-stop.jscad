//
// Door stop part.
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
	var r = 20; // radius
	var n = 3; // width
	var d = 3; // depth
	var tt1 = 0.5; // t1 tolerance
	var tt2 = 0.2; // t2 tolerance
	var d2 = 2;
	
	var c = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, d],
			radius: r
		}).rotateX(-90);
	var s = CSG.sphere({
		center: [0, 0, 0],
		radius: r})
	.translate([0, d, 0])
	.union(c)
	.intersect(CSG.cube({
		corner1: [-r, 0, 0],
		corner2: [r, r+d, r]
	}));
	
	var t1 = linear_extrude({height: r}, polygon([[-n, 0], [n, 0], [n+d+tt1, d], [-(n+d+tt1), d]]));
	var t2 = linear_extrude({height: r}, polygon([[-n+tt2, 0], [n-tt2, 0], [n+d-tt2, d], [-(n+d-tt2), d]]))
		.rotateX(-90).translate([0, 0, d]);
	var t3 = linear_extrude({height: 2*(d-tt2)}, polygon([[0, 0], [0, d], [d2, d]]))
		.rotateY(-90)
		.rotateX(90)
		.translate([d-tt2, 0, 0]);
/*
	var t = polyhedron({      // openscad-like (e.g. pyramid)
	  points: [ [-n, 0 ,0],[n, 0, 0],[-n+d, d, 0],[n-d, d, 0], // the four points at base
				[-n, 0 ,r],[n, 0, r],[-n+d, d, r],[n-d, d, r] ],
	  triangles: [ [0,1,2],[1,2,3],[4,5,6],[5,6,7],          // each triangle side
				   [1,0,3],[2,1,3] ]                         // two triangles for square base
});

	var slot = CSG.cube({
			center: [0,0,height/2],
			radius: [large_r,slot_width/2,height/2]
		});
*/
	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return union(t2, t3);
			
		case 'piece_with_slot':
			return s.subtract(t1);
	}
}	
