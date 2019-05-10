// title      : Arducam adapter
// author     : Udi Finkelstein
// license    : MIT License
// revision   : 0.1

const res = 48;

// extend cylinder with fillet
function cyl(p) {
    if (!p.hasOwnProperty('fn')) {
        p.fn = res;
    }

	if (p.fillet > 0) {
    	var t = difference(
    		cylinder({h:p.fillet, r:p.r+p.fillet, fn:p.fn}),
    		torus({ri:p.fillet, ro:p.r+p.fillet, fni:p.fn, fno:p.fn}).translate([0, 0, p.fillet])
    	);
    	return union(cylinder(p), t);
	}
	return cylinder(p);
}

function main() {
    const w1 = 45.7;
    const r1 = 3/2;
    const r2 = 20/2;
    const r3 = 5/2;
    const r4 = 5.2/2;
    const h1 = 10;
    const h2 = 10;
    cutout = cube({size: [20, 21, 7], center:[true, true, false], round:true, fn:res}).translate([0, 0, -2]);
    side1 = cube({size: [10, 19, 5], center:[true, true, false], round:true, fn:res}).translate([-19, 0, 0]);
    side2 = union(side1, side1.rotateZ(180));
	return intersection(
	    difference(
    	    union(
    		    cube({size: [61.5, 19, 10], center:[true, true, false], round:true, fn:res}),
    		    cube({size: [20, 19, 4], center:[true, true, false]}).translate([0, 0, 6]),
        		cyl({r:r2, h:h2-2, center:[true, true, false], fillet:1}).translate([0, 0, h1]),
        		cyl({r:r2-1, h:1, center:[true, true, false]}).translate([0, 0, h1+h2-2]),
        		torus({ro:r2-1, ri:1, center:[true, true, false]}).translate([0, 0, h1+h2-2])
    		),
    		cyl({r:r1, h:h1, center:[true, true, false]}).translate([-(w1/2+r4), 0, 0]),
    		cyl({r:r1, h:h1, center:[true, true, false]}).translate([ (w1/2+r4), 0, 0]),
    		cutout,
    		cyl({r:r3, h:(h1+h2), center:[true, true, false]})
    	),
	    cube({size: [61.5, 19, 20], center:[true, true, false]})
    ).rotateX(90);

}
