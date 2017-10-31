//
// Lens adapter
//
//include ('jscad-utils.jscad')
//include ('jscad-utils-color.jscad')
function getParameterDefinitions() {

	return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4, 5],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)', 'ultra high (96,256)'],
        initial: 3,
        caption: 'Resolution:'
    }, {
        name: 'length',
        type: 'float',
        initial: 23.0,
        caption: 'Total adapter Length'
    }, {
        name: 'teeth',
        type: 'float',
        initial: 86,
        caption: 'Number of teeth'
    }, {
        name: 'teeth_high',
        type: 'float',
        initial: 5.84,
        caption: 'height of teeth edge relative to inner wide radius'
    }, {
        name: 'teeth_height',
        type: 'float',
        initial: 1.73,
        caption: 'height of teeth'
    }, {
        name: 'teeth_low_w',
        type: 'float',
        initial: 1,
        caption: 'width of space between teeths'
    }, {
        name: 'teeth_high_w',
        type: 'float',
        initial: 1,
        caption: 'width of top of teeths'
    }, {
        name: 'gear_length',
        type: 'float',
        initial: 4.0,
        caption: 'length of gear section'
    }, {
        name: 'inner_w_r',
        type: 'float',
        initial: 76.12/2,
        caption: 'Inner wide radius, covering lens switches'
    }, {
        name: 'inner_length',
        type: 'float',
        initial: 7.8,
        caption: 'length of section with inner wide radius'
    }, {
        name: 'inner_n_r',
        type: 'float',
        initial: 72/2,
        caption: 'Inner narrow radius, covering the lens parrel itself'
    }, {
        name: 'outer_r',
        type: 'float',
        initial: 81.1/2,
        caption: 'Outer radius'
    }, {
        name: 'slot_width',
        type: 'float',
        initial: 1,
        caption: 'Width of opening in the ring'
    }, {
        name: 'handle',
        type: 'checkbox',
        checked: true,
        caption: 'Add handles to ease opening/closing the slot'
    }, {
        name: 'handle_distance',
        type: 'float',
        initial: 2,
        caption: 'distance of handle from outer ring'
    }, {
        name: 'handle_radius',
        type: 'float',
        initial: 3,
        caption: 'thickness of handle (outer radius)'
    }, {
        name: 'handle1_start',
        type: 'float',
        initial: 6,
        caption: 'start position of handle1'
    }, {
        name: 'handle1_end',
        type: 'float',
        initial: 14,
        caption: 'end position of handle1'
    }, {
        name: 'handle2_start',
        type: 'float',
        initial: 15,
        caption: 'start position of handle2'
    }, {
        name: 'handle2_end',
        type: 'float',
        initial: 23,
        caption: 'end position of handle2'
    }, {
        name: 'handle_width_factor',
        type: 'float',
        initial: 1.5,
        caption: 'Width of opening in the ring'
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
	var inner_n_r = params.inner_n_r;
	// A bit wider, giving space to the lens buttons
	var inner_w_r = params.inner_w_r;
	// Outer diameter of the adapter
	var outer_r = params.outer_r;
	// Adapter length
	var length = params.length;
	// Length of the inner space for buttons
	var inner_length = params.inner_length;
	// Length of the gear surrounding the adapter
	var gear_length = params.gear_length;
	// number of teeth
	var teeth = params.teeth;
	// distance from inner_w_r to top of nearest teeth
	var teeth_high = params.teeth_high;
	// distance from inner_w_r to the valley between teeths
	var teeth_height = params.teeth_height;
	// width of valley between teeths
	var teeth_low_w = params.teeth_low_w;
	// width of teeth peak
	var teeth_high_w = params.teeth_high_w;
	// Width of cut slot
	var slot_width = params.slot_width;
	// Distance of handle from gear ring
	var handle_distance = params.handle_distance;
	var handle_radius = params.handle_radius;
	var handle1_start = params.handle1_start;
	var handle1_end = params.handle1_end;
	var handle2_start = params.handle2_start;
	var handle2_end = params.handle2_end;
	var handle_width_factor = params.handle_width_factor;
	
	

	//
	// Calculated:
	//

	// factor needed to enlarge radius so that the perimeter is enlarged by the slot width
	var slot_factor = 2*pi*inner_w_r/(2*pi*inner_w_r+slot_width);
	// radius of cylinder on which the teeth starts (a bit larger than outer_r)
	var gear_r = inner_w_r + (teeth_high - teeth_height);
	// width of teeth base
	var teeth_base_d = (2*pi*gear_r)/teeth;
	var teeth_base_w = (2*pi*gear_r)/teeth-teeth_low_w;
	// Height of teeth triangle (will be trimmed later)
	var teeth_triangle_height = teeth_base_w/(teeth_base_w-teeth_high_w)*teeth_height;
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
	points.push(new CSG.Vector2D((gear_r+teeth_triangle_height)/slot_factor, 0));
	var tooth3d = new CSG.Polygon2D(points).extrude({offset: [0, 0, gear_length]});
	var teeth3d;
	// Now clone it around the adapter
	for (i = 0; i < teeth; i++) {
		var t = tooth3d.rotateZ((i+0.5)/teeth*360*slot_factor);
		teeth3d = (i == 0) ? t : teeth3d.union(t);
	}
	// Clip it by the bounding cylinder
	teeth3d = teeth3d.intersect(gear_bounding_cyl);

	// Create a slot
	if (slot_width > 0) {
		var slot_radius = gear_bounding_r/slot_factor;
		var cyl1 = CSG.cylinder({
			start: [0,0,0],
			end: [0, 0, length],
			radius: slot_radius
		}).intersect(CSG.cube({
			corner1: [-slot_radius, 0           , 0],
			corner2: [ slot_radius, -slot_radius, length]
		}));
		var scale_factor1 = (slot_radius+handle_radius)/slot_radius;
		var outer_r_adj = outer_r/slot_factor;
		var scale_factor2 = (outer_r_adj+handle_distance)/slot_radius;
		var slot_angular_width = 360*slot_width/(2*pi*slot_radius);
		var slot3d = cyl1.intersect(cyl1.rotateZ(180-slot_angular_width));
		base = base.subtract(slot3d);
		if (params.handle) {
			var handle1 = cyl1.scale([scale_factor1, scale_factor1, 1])
			                  .subtract(cyl1.scale([scale_factor2, scale_factor2, 1]));
			    handle1 = handle1.rotateZ(slot_angular_width*handle_width_factor)
						         .intersect(handle1.rotateZ(180-slot_angular_width*(1+handle_width_factor)));
			var handle2_inner_scale = inner_w_r/gear_bounding_r;
			var handle2 = cyl1.scale([scale_factor1, scale_factor1, 1])
			                  .subtract(cyl1.scale([handle2_inner_scale, handle2_inner_scale, 1]));
			    handle2 = handle2.rotateZ(slot_angular_width*handle_width_factor)
				                 .intersect(handle2.rotateZ(180));
			var handle3 = handle2.rotateZ(-(1+handle_width_factor)*slot_angular_width);
			// Trim height
			    handle2 = handle2.translate([0, 0, handle1_start]).intersect(handle2.translate([0, 0, handle1_end-length]));
			    handle3 = handle3.translate([0, 0, handle2_start]).intersect(handle3.translate([0, 0, handle2_end-length]));
			var handle4 = handle1.translate([0, 0, handle1_start]).intersect(handle1.translate([0, 0, handle1_end-length]));
			var handle5 = handle1.translate([0, 0, handle2_start]).intersect(handle1.translate([0, 0, handle2_end-length]));
			base = base.union(handle2).union(handle3).union(handle4).union(handle5);
		}
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
			return handle1;
	}
}	
