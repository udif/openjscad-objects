// title      : FOMU Jig
// author     : Udi Finkelstein
// license    : MIT License
// revision   : 0.1

// This is a test Jig to hold 1mm pogo pins for programming a Fomu board
// You can prepare the pins in advance, solder all the wires, then insert them on the slots.
// Once pins are in, insert the sleeve so that the triangle is on the sleeve open side,
// And the pogo pins are held in place by the sleeve.
//
// You can now put the Fomu board on top
let r=(1 + 0.30)/2; // pogo pin radius plus some FDM process slack
let z=8; // height of main jig box
let base=2; // sleeve base thickness
let bumps = 4; // height of tirngle and semicircle locating the board
let z_bumps=z+bumps; // total height
let mx=2; // extra margin on each side for sleeve
let my=2; // extra margin on one side for sleeve
let x=10+2*mx; // board width plus extra margins
let y=13+my; // board depth plus extra margin
let extra_x=0.5; // extra X clearance for FDM process margins
let extra_y=0.5; // extra Y clearance for FDM process margins
let extra_z=0.2; // extra Z clearance for FDM process margins
let sleeve_z = base+z+bumps+extra_z;
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
            cylinder({r:1.5/2, h:z_bumps, center:false}),
            cube({size:[1.5, 1.5, z_bumps], center:[false, true, false]})
        )
        .translate([mx, -11, 0]),
        linear_extrude({height:bumps}, mirror([0, 1, 0], polygon([[x-mx,y-my], [x-mx-corner,y-my], [x-mx, y-my-corner]])))
        .translate([0, 0, z])

    );

}

function part4 () {
    return mirror([0, 1, 0],
        difference(
            // Outer cube
            cube({size: [x+2*mx, y+my, sleeve_z], center: false}),
            // Subtract inner space from top to bottom
            cube({size: [x-2*mx+extra_x/2, y-(my-extra_y), sleeve_z], center: false}).translate([2*mx, 0, 0]),
            // Subtract wider slot that holds the pins in place
            cube({size: [x-extra_x+extra_x/2, y-extra_y, (z+extra_z)], center: false}).translate([mx, 0, base])
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
        //part1(),
        //part2().translate([20, 0, 0]),
        part3().translate([0, 0, 0]),
        part4().translate([0, 0, -z]).rotateX(90).translate([0, 15, y+my])
    );
}
