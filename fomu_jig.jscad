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
let r=(1 + 0.10)/2; // pogo pin radius plus some FDM process slack
let z=8; // height of main jig box
let base=2; // sleeve base thickness
let bumps = 4; // height of tirngle and semicircle locating the board
let z_bumps=z+bumps; // total height
let mx=2; // extra margin on each side for sleeve
let my=2; // extra margin on one side for sleeve
let x=10+2*mx; // board width plus extra margins
let y=13+my; // board depth plus extra margin
let extra_x=0; // extra X clearance for FDM process margins
let extra_y=0; // extra Y clearance for FDM process margins
let extra_z=0.2; // extra Z clearance for FDM process margins
let sleeve_z = base+z+bumps+extra_z;
let handle_y = 5;
let handle_x_extra = 5;
let corner=3; 
let x_distance=1; // X hole row distance from the edge
let y_distance = 1.25; // Y hole row distance from the edge
let pins = false; // change this to see how pins would appear in the holes
let for_print = true; // change to false to see how the 2 modules interlock

function block () {
    return cube({size: [x, y, z], center: false});
}
function block_with_pins () {

    var pins_obj = union(
        y_slot(8.7),
        y_slot(5.25),
        y_slot(3.50),
        y_slot(1.65),
        x_slot(3.30),
        x_slot(5.30),
        x_slot(8.20)
    )
    return mirror([0, 1, 0],
        pins ? union     (block(), pins_obj)
             : difference(block(), pins_obj)
    );

}

function jig () {
    return union(
        block_with_pins(),
        // handle
        cube({size: [x+2*handle_x_extra, handle_y, z], center: false}).translate([-handle_x_extra, -(y+handle_y), 0]),
        // half circle notch in board
        cylinder({r:1.5/2, h:z_bumps, center:false}).translate([mx, -11-my, 0]),
        // cube holding semi circle
        cube({size:[mx, y-8.20-my-r, z_bumps], center:[false, false, false]}).translate([0, -y, 0]),
        linear_extrude({height:bumps}, mirror([0, 1, 0], polygon([[x-mx,y-my], [x-mx-corner,y-my], [x-mx, y-my-corner]])))
        .translate([0, -my, z]),
        // cube holding triangle
        cube({size:[mx, y-8.20-my-r, z_bumps], center:[false, false, false]}).translate([x-mx, -y, 0])
    );

}

function sleeve () {
    return difference(
            // Outer cube
            cube({size: [x+2*mx, y+my, sleeve_z], center: false}),
            // Subtract inner space from top to bottom
            cube({size: [x-2*mx+extra_x/2-(x_distance-r), y-(my-extra_y)-(y_distance-r), sleeve_z], center: false}).translate([2*mx+(x_distance-r), 0, 0]),
            // Subtract wider slot that holds the pins in place
            cube({size: [x+extra_x, y+extra_y, (z+extra_z)], center: false}).translate([mx-extra_x/2, 0, base]),
            // Subtract outer cut for PCB fixture pins
            cube({size: [x+extra_x, y-8.20-my-r, sleeve_z], center: false}).translate([mx-extra_x/2, 0, base+z])
        )
    .union(cube({size: [x+2*handle_x_extra, handle_y, sleeve_z], center: false}).translate([mx-handle_x_extra, y+my, 0]))
    .translate([-mx, 0, 0]);

}
function y_slot (dx, dy=y_distance) {
    return union(
        cylinder({r:r, h:3*z, center: false}).translate([dx+mx, dy+my, -z]),
        cube({size:[2*r, dy+my ,z], center:[true, false, false]}).translate([dx+mx, 0, 0])
    );
}

function y_neg_slot (dx, dy=y_distance) {
    return union(
        cylinder({r:r, h:3*z, center: false}).translate([dx+mx, dy, -z]),
        cube({size:[2*r, y ,z], center:[true, false, false]}).translate([dx+mx, dy, 0])
    );
}

function x_slot (dy=2, dx=x_distance) {
    return union(
        cylinder({r:r, h:3*z, center: false}).translate([dx+mx, dy+my, -z]),
        cube({size:[dx+mx, 2*r, z], center:[false, true, false]}).translate([0, dy+my, 0])
    );
}

function main() {
    var sleeve2 = sleeve().translate([0, -y, -base]);
    sleeve2 = for_print ? sleeve2.rotateX(-90).translate([0, -20-y, 2*my+handle_y-base]) : sleeve2.translate([0, 0, -base]);
    return union(
        jig(), sleeve2 //.rotateZ(180).translate([15, -15, z-base])
//      sleeve().translate([0, 0, -z]).translate([0, -20, z-base])
//        sleeve().translate([0, 0, -z]).rotateX(90).translate([0, -30, y+my])
    );
}
