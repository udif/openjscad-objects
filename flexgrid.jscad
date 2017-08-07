// title      : Flex Grid
// author     : Udi Finkelstein <github@udifink.com>
// license    : 
// Based on   : http://www.instructables.com/id/Flexible-3D-Printing/

/* exported main, getParameterDefinitions */
function getParameterDefinitions() {

    return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 0,
        caption: 'Resolution:'
    }, {
        name: 'thickness',
        type: 'float',
        initial: 1.0,
        caption: 'Thickness:'
    }, {
        name: 'width',
        type: 'float',
        initial: 2,
        caption: 'Track width:'
    }, {
        name: 'xmult',
        type: 'float',
        initial: 2,
        caption: 'X multiplier'
    }, {
        name: 'ymult',
        type: 'float',
        initial: 2,
        caption: 'Y multiplier:'
    }, {
        name: 'complexity',
        type: 'float',
        initial: 2,
        caption: 'Complexity:'
    }, {
        name: 'space',
        type: 'float',
        initial: 0.5,
        caption: 'Element spacing:'
    }, {
        name: 'gpio',
        type: 'checkbox',
        checked: true,
        caption: 'GPIO:'
    }];
}

function snake_cube (w, t) {
	return CSG.cube({center:[0, 0, 0], radius:[w/2, w/2, t/2]});
}
// input is an array of the form [[x0, y0], [x1, y1], ...]
// output will render snake_cube() for all the location
function snake(params, elems) {
	var x = elems[0][0];
	var y = elems[0][1];
	var w = params.width;
	var s = params.space;
	var t = params.thickness;
	
	var obj = snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]);
	for (var i = 1; i < elems.length; i++) {
		if (elems[i][0] == x) {
			// Move on Y axis
			if (y < elems[i][1]) {
				// Incrememnt Y
				while (y < elems[i][1]) {
					obj = obj.union(snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]));
					y += 0.5;
				}
			} else {
				// Decrememnt Y
				while (y > elems[i][1]) {
					obj = obj.union(snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]));
					y -= 0.5;
				}
			}
			y = elems[i][1]; // don't let FP errors accumulate
		} else if (elems[i][1] == y) {
			// Move on X axis
			if (x < elems[i][0]) {
				// Incrememnt X
				while (x < elems[i][0]) {
					obj = obj.union(snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]));
					x += 0.5;
				}
			} else {
				// Decrememnt X
				while (x > elems[i][0]) {
					obj = obj.union(snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]));
					x -= 0.5;
				}
			}
			x = elems[i][0]; // don't let FP errors accumulate
		} else {
			x = elems[i][0];
			y = elems[i][1];
		}
		obj = obj.union(snake_cube(w, t).translate([x*(w+s), y*(w+s), 0]));
	}
	return obj;
}

function spiral(params) {
	var e = params.e; // epsilon
	var w = params.width;
	var t = params.thickness;
	var s = params.space;
	var c = params.complexity*2+1; // complexity
	
	var sign = ((c % 4) == 1) ? 1 : -1;
	
	var dx = -e*sign;
	var dy = 0;
	var snake_arr = [ [dx, dy] ];
	dx = sign *(c-1);
	snake_arr.push([dx, dy]);
	for (var dc = c - 2; dc >= 1; dc -= 2) {
		if (dc % 4 == 3) {
			dy += dc;
			snake_arr.push([dx, dy]);
			dx -= dc;
			snake_arr.push([dx, dy]);
		} else { // dc%4==1
			dy -= dc;
			snake_arr.push([dx, dy]);
			dx += dc;
			snake_arr.push([dx, dy]);
		}
	}
	var half_snake = snake(params, snake_arr)
	.translate([-(w+s)*sign*(c-1)/2, -(w+s)*sign*(c-1)/2, 0]);
	return half_snake.union(half_snake.rotateZ(180)).translate([(w+s)*sign*c/2, (w+s)*sign*c/2, 0]);
	
}

function spiral4(params) {
	var s = params.space;
	var e = params.e;
	var t = params.thickness;
	
	return union(
		spiral(params),
		spiral(params).rotateZ(90),
		spiral(params).rotateZ(180),
		spiral(params).rotateZ(270),
		snake_cube((s+e), t)
	);
}

function grid(params) {
	var w = params.width;
	var s = params.space;
	var e = params.e;
	var t = params.thickness;
	var xm = params.xmult;
	var ym = params.ymult;
	var gw = (params.complexity*2+1)*2*(w+s);
	var gobj = spiral4(params);
	
	for (var x = 0; x < xm; x++) {
		for (var y = 0; y < ym; y++) {
			gobj = gobj.union(spiral4(params).translate([x*gw, y*gw, 0]));
			if ((x*y) > 0) {
				gobj = gobj.union(snake_cube((s+2*e), t).translate([(x-0.5)*gw, (y-0.5)*gw, 0]));
			}
		}
	}
	return gobj;
}
function main(params) {
    // echo('params', JSON.stringify(params));

    var resolutions = [
        [6, 16],
        [8, 24],
        [12, 32],
        [24, 64],
        [48, 128]
    ];
    CSG.defaultResolution3D = resolutions[params.resolution][0];
    CSG.defaultResolution2D = resolutions[params.resolution][1];
	params.e = params.space;
	
	return grid(params);
}