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
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)', 'ultra high (96,256)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['piece', 'piece_with_slot'],
        captions: ['piece',  'piece with middle slot'],
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

	//
	// Input parameters
	//
	var pi = 3.14159;
	// The narrow radius , sa as the lens radius
	var inner_n_r = 72/2;
	// A bit wider, giving space to the lens buttons
	var inner_w_r = 76.12/2;
	// Outer diameter of the adapter
	var outer_r = 81.1/2;
	// Adapter length
	var length = 23;
	// Length of the inner space for buttons
	var inner_length = 7.8;
	// Length of the gear surrounding the adapter
	var gear_length = 4;
	// number of teeth
	var teeth = 86;
	// distance from inner_w_r to top of nearest teeth
	var teeth_high = 5.84;
	// distance from inner_w_r to the valley between teeths
	var teeth_low = 4.11;
	// width of valley between teeths
	var teeth_low_w = 1;
	// width of teeth peak
	var teeth_high_w = 1;
	// Width of cut slot
	var slot_width = 1;

	//
	// Calculated:
	//
	
	var slot_factor = 2*pi*inner_w_r/(2*pi*inner_w_r+slot_width);
	// radius of cylinder on which the teeth starts (a bit larger than outer_r)
	var gear_r = inner_w_r + teeth_low;
	// width of teeth base
	var teeth_base_d = (2*pi*gear_r)/teeth;
	var teeth_base_w = (2*pi*gear_r)/teeth-teeth_low_w;
	// Height of teeth triangle (will be trimmed later)
	var teeth_height = teeth_base_w/(teeth_base_w-teeth_high_w)*(teeth_high-teeth_low);
	// radius of teeth peak
	var gear_bounding_r = inner_w_r + teeth_high;
	//var teeth_angle = 2*pi*(2*pi*gear_r-slot_width)/(2*pi*gear_r)/teeth;
	var teeth_angle = 2*pi/teeth*teeth_base_w/teeth_base_d*slot_factor;

	// Main cylinder
	var ext_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: outer_r/slot_factor
		});
	// the small cylinder on which we put the teeth
	var gear_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, gear_length],
			radius: gear_r/slot_factor
		});
	// This cylinder clips the gear teeths 
	var gear_bounding_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, gear_length],
			radius: gear_bounding_r/slot_factor
		});
	// 
	var in1_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: inner_n_r/slot_factor
		});
	var in2_cyl = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, inner_length],
			radius: inner_w_r/slot_factor
		});

	var base = union(ext_cyl, gear_cyl).subtract(union(in1_cyl, in2_cyl));
	// Create a single gear teeth
	var points = [new CSG.Vector2D.fromAngle(teeth_angle/2).times(gear_r/slot_factor)];
	points.push(new CSG.Vector2D.fromAngle(-teeth_angle/2).times(gear_r/slot_factor));
	points.push(new CSG.Vector2D((gear_r+teeth_height)/slot_factor, 0));
	var tooth3d = new CSG.Polygon2D(points).extrude({offset: [0, 0, gear_length]});
	var teeth3d;
	// Now clone it around the adapter
	for (i = 0; i < teeth; i++) {
		var t = tooth3d.rotateZ((i+0.5)/teeth*360*slot_factor)
		teeth3d = (i == 0) ? t : teeth3d.union(t);
	}
	// Clip it by the bounding cylinder
	teeth3d = teeth3d.intersect(gear_bounding_cyl);

	// Create a slot
	if (slot_width > 0) {
		var cyl1 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: gear_bounding_r/slot_factor
		}).intersect(CSG.cube({
			corner1: [-gear_bounding_r/slot_factor, 0                          , 0],
			corner2: [ gear_bounding_r/slot_factor, -gear_bounding_r/slot_factor, length]
		}));
		var slot3d = cyl1.subtract(cyl1.scale([1.1,1.1,1]).rotateZ(-360*slot_width/(2*pi*gear_bounding_r/slot_factor)));
		base = base.subtract(slot3d);
	}

/*	
	var connect = CSG.cube({
			center: [small_cyl_offset/2,0,height/2],
			radius: [small_cyl_offset/2,width/2,height/2]
		});
*/

	//
	// Render
	//
	switch (params.part) {
		case 'piece':
			return base.union(teeth3d);
			
		case 'piece_with_slot':
			return slot3d;
	}
}	
