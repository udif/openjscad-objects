// title      : FOMU Jig
// author     : Udi Finkelstein
// license    : MIT License
// revision   : 0.1

let r=1.30/2;
let z=2;
let mx=2;
let my=2;
let x=10+2*mx;
let y=13+my;
let extra_x=0.5;
let extra_y=0.5;
let extra_z=0.2;
let corner=3;

function part () {
    return cube({size: [x, y, z], center: false});
}
function part1 () {
    return mirror([0, 1, 0],
        difference(
            part(), 
            union(
                y_slot(8.7),
                y_slot(5.25),
                y_slot(3.50),
                y_slot(1.65),
                x_slot(3.30),
                x_slot(5.30),
                x_slot(8.20)
            )
        )
    );

}

function part2 () {
    return mirror([0, 1, 0],
        difference(
            part(), 
            union(
                x_slot(dx=1.25, dy=8.7),
                y_neg_slot(dx=1, dy=3.30)
            )
        )
    );

}

function part3 () {
    return union(
        part1(),
        intersection(
            cylinder({r:1.5/2, h:4, center:false}),
            cube({size:[1.5, 1.5, 4], center:[false, true, false]})
        )
        .translate([mx, -11, 0]),
        linear_extrude({height:z}, mirror([0, 1, 0], polygon([[x-mx,y-my], [x-mx-corner,y-my], [x-mx, y-my-corner]])))
        .translate([0, 0, z])
        
    );

}

function part4 () {
    return mirror([0, 1, 0],
        difference(
            cube({size: [x+2*mx, y+my, (z+extra_z)*5], center: false}), 
            cube({size: [x-2*(mx-extra_x), y-(my-extra_y), (z+extra_z)*5], center: false}).translate([2*mx, 0, 0]),
            cube({size: [x-extra_x, y-extra_y, (z+extra_z)*3], center: false}).translate([mx, 0, (z+extra_z)])
        )
    ).translate([-mx, 0, 0]);

}
function y_slot (dx, dy=1.25) {
    return union(
        cylinder({r:r, h:z, center: false}).translate([dx+mx, dy, 0]),
        cube({size:[2*r, dy ,z], center:[true, false, false]}).translate([dx+mx, 0, 0])
    );
}

function y_neg_slot (dx, dy=1.25) {
    return union(
        cylinder({r:r, h:z, center: false}).translate([dx+mx, dy, 0]),
        cube({size:[2*r, y ,z], center:[true, false, false]}).translate([dx+mx, dy, 0])
    );
}

function x_slot (dy=2, dx=1) {
    return union(
        cylinder({r:r, h:z, center: false}).translate([dx+mx, dy, 0]),
        cube({size:[dx+mx, 2*r, z], center:[false, true, false]}).translate([0, dy, 0])
    );
}

function main() {
    return union(
        part1(),
        part2().translate([20, 0, 0]),
        part3().translate([20, 20, 0]),
        part4().translate([0, 0, -z]).rotateX(90).translate([0, 15, y+my])
    );
}