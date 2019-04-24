// title      : Arducam adapter
// author     : Udi Finkelstein
// license    : MIT License
// revision   : 0.1

const res = 48;

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function cent(o) {
    [a, b] = o.getBounds();
}

// extend cylinder with fillet
function cyl(p) {
    p.fn = res;

	if (p.fillet > 0) {
    	var t = difference(
    		cylinder({h:p.fillet, r:p.r+p.fillet, fn:p.fn}),
    		torus({ri:p.fillet, ro:p.r+p.fillet, fni:p.fn, fno:p.fn}).translate([0, 0, p.fillet])
    	);
    	return union(cylinder(p), t);
	}
	return cylinder(p);
}

function fillet_sqr(x, y, r) {
	return difference(
		cube({size:[x+2*r, y+2*r, r], center:true}).translate([0, 0, r/2]),
		cube({size:[x, y, 2*r], center:true}),
		cyl({r:r, h:x+4*r, center:true}).rotateX(90).translate([-x/2-r, 0, r]),
		cyl({r:r, h:x+4*r, center:true}).rotateX(90).translate([ x/2+r, 0, r]),
		cyl({r:r, h:y+4*r, center:true}).rotateY(90).translate([0, -y/2-r, r]),
		cyl({r:r, h:y+4*r, center:true}).rotateY(90).translate([0,  y/2+r, r])
	);
}	
function cubex(p) {
    var t;
    p.fn = res;
    
	if (p.fillet > 0) {
    	t = fillet_sqr(p.size[0], p.size[1], 1);
    	return union(cube(p), t);
	} else {
	    return cube(p);
	}
}

function screw_hole() {
    return difference(
        cyl({r:3.5, h:8, center: [true, true, true]}),
        cyl({r:1.5, h:8, center: [true, true, true], fillet:1})
    );
}

function dist_obj(o, w) {
    return union(
        o.translate([ w/2,  w/2, 0]),
        o.translate([ w/2, -w/2, 0]),
        o.translate([-w/2,  w/2, 0]),
        o.translate([-w/2, -w/2, 0])
    );
}


function main() {
    
    const w1 = 40;
    const w2 = 3;
    const h1 = 6;
    const h2 = 1;
    const h3 = 3.5; // total screw height
    const h4 = 1.4; // narrow screw hole height
    const d1 = 28.8;
    const l1 = 5;
    const r = 1;

    const handle = difference (
        union(
    		cyl({r:2.5, h:7.5, center: [true, true, true]}).rotateY(90),
    		cube({size:[7.5, l1+r, h1-r], center: [true, false, true], fillet:1}),
    		fillet_sqr(7.5, h1-r, r).rotateX(90).translate([0, l1, 0])
    	),
	    cyl({r:1.5, h:7.5, center: [true, true, true]}).rotateY(90),
	    // cut lower fillet
	    cubex({size:[2*w1, 2*w1, r], center: [true, false, true]}).translate([0, 0, -h1+r+2]),
	    // cut left/right fillet
	    cubex({size:[r, l1+r, r], center: [true, false, true]}).translate([(7.5+r)/2, 0, -h1+r+3]),
	    cubex({size:[r, l1+r, r], center: [true, false, true]}).translate([-(7.5+r)/2, 0, -h1+r+3]),
	    cyl({r:1}).rotateY(90).translate([ (7.5/2), l1-r, -(h1-r)/2+r]),
	    cyl({r:1}).rotateY(90).translate([-(7.5/2)-r, l1-r, -(h1-r)/2+r])
	).translate([0, 0, (h1-r)/2]);
	//return handle;
	const empty_box = difference (
	    // outer box
	    cubex({size:[w1, w1, h1+r], center: [true, true, false], radius:r}),
	    // cut rounded top
	    cubex({size:[w1, w1, h1+r], center: [true, true, false]}).translate([0, 0, h1]),
	    // cut inner space
        cubex({size:[w1 - w2, w1 - w2, h1], center: [true, true, false]}).translate([0, 0, h2]),
        // slot
        cubex({size:[17, 0.8, h1], center: [true, false, false]}).translate([0, -w1/2+w2/2, 0])
	).translate([0, w1/2+l1, 0]);
	return difference (
	    union(
	        handle,
	        empty_box,
	        dist_obj(cyl({r:4.2, h:h3, center: [true, true, false], fillet:1}), d1).translate([0, w1/2+l1, h2])
	    ),
	    union(
            dist_obj(cyl({r:1.5, h:h3*2, center: [true, true, true]}), d1).translate([0, w1/2+l1, h3-h4]),
            dist_obj(cyl({r:3.1, h:h3-h4, center: [true, true, false], fillet:1}), d1).translate([0, w1/2+l1, 0])
        )
    );
}
