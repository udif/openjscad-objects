// 
//
//
let r1=156/2;
let r2=105/2;
let h=20;
let h0=-0.5;
let w=2;
let h1 = h-4;

function get_r(rh) {
    return r1-(r1-r2)/h*rh;
}

function c_old(rh) {
    let rw=2;
    let rr0 = r1-(r1-r2)/h*rh;
    let rr1 = r1-(r1-r2)/h*(rh+1);
    let rr2 = r1-(r1-r2)/h*(rh+2);
    return union(
        cylinder({r1:(rr0-rw)/2, r2:(rr1-rw)/2, h:1, fn:90}).translate([0, 0, rh]),
        cylinder({r1:(rr1-rw)/2, r2:(rr2-w)/2, h:1, fn:90}).translate([0, 0, rh+1])
    );
}

// vertical cylinder minus spiral cutout
function v(rh, s) {
    return difference (
        cylinder({r:rh, h:4, fn:90}),
        cylinder({r:rh-4, h:4, fn:90}),
        c(rh, s)
    );
}

// spiral cutout
function c(rh, s) {
    var hex = CSG.Polygon.createFromPoints(
		(s == 1) ?[
			[0, 0, 0],
    		[0, w, 0],
    		[0.4, w, 0],
    		[2, 0, 0]
		] : [
			[0, 0, 0],
    		[0, w, 0],
    		[0.4, w, 0],
    		[2, 0, 0]]
		);
    var angle = 4;
    let spiral =  hex.solidFromSlices({
    	numslices: 360 / angle+1,
    	callback: function(t, slice) {
    	    let p = 0.98;
    	    let t2 = (t < p) ? 1 : 1-s*(t-p)/(1-p);
    	    //let r = r1-(r1-r2)/h*(rh+2*t2);
    		return this.translate([2*t2 , rh-w-2.1, 0]).rotate(
    					[0,0,0],
    					[-1, 0, 0],
    					angle * slice
    				);
    	}
    });
    return spiral.rotateY(-90);
}
function main () {
    //return c(-0.5, 1);
    let cy = difference (
        cylinder({r1:r1, r2:r2, h:h, fn:90}),
        cylinder({r1:(r1-w), r2:(r2-w), h:h, fn:90}));
    let s = union(c(h0, 1), c(h1, -1));
    switch(5) {
        case 0: return difference(cy, s);
        case 1: return s;
        case 2: return union(s, cylinder({r:r1-4, h:h}));
        case 3: return union(s, cy);
		case 4: return union(
			v(r1, 1),
			cy.translate([0, 0, 4]),
			v(r2, -1).translate([0, 0, 4+h])
		);
		case 5: return cy;
    }
}
