// title      : picase
// author     : John Cole
// license    : ISC License
// file       : picase.jscad

include ('jscad-utils.jscad')
include ('jscad-utils-color.jscad')
include ('jscad-raspberrypi.jscad')
include ('jscad-utils-parts.jscad')
include ('jscad-boxes.jscad')
include ('kodi_logo.jscad')

/* exported main, getParameterDefinitions */
function getParameterDefinitions() {

    return [{
        name: 'resolution',
        type: 'choice',
        values: [0, 1, 2, 3, 4],
        captions: ['very low (6,16)', 'low (8,24)', 'normal (12,32)', 'high (24,64)', 'very high (48,128)'],
        initial: 2,
        caption: 'Resolution:'
    }, {
        name: 'part',
        type: 'choice',
        values: ['top', 'bottom', 'assembled', 'board'],
        captions: ['top', 'bottom', 'assembled', 'board-only'],
        initial: 'assembled',
        caption: 'Part:'
    }, {
        name: 'type',
        type: 'choice',
        values: ['b_v1', 'b_v2', 'bplus', 'b3'],
        captions: ['RaspberryPi B v1', 'RaspberryPi B v2', 'RaspberryPi 2', 'RaspberryPi 3'],
        initial: 'b3',
        caption: 'Board Type:'
    }, {
        name: 'thickness',
        type: 'float',
        initial: 2.0,
        caption: 'Thickness:'
    }, {
        name: 'gpio',
        type: 'checkbox',
        checked: true,
        caption: 'GPIO:'
    }, {
        name: 'camera',
        type: 'checkbox',
        checked: true,
        caption: 'Camera:'
    }, {
        name: 'logo',
        type: 'checkbox',
        checked: true,
        caption: 'Render Logo:'
    }, {
        name: 'display',
        type: 'checkbox',
        checked: true,
        caption: 'Display:'
    }, {
        name: 'text',
        type: 'text',
        initial: '',
        caption: 'Text:'
    }];
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
    util.init(CSG);

    var thickness = params.thickness;
    var BPlus;
	var mounting;
	var usb2 = false;
	var usb2ports='';
	var usb2clearance='';
	var av_ports;
	switch (params.type) {
		case 'b_v1':
			BPlus = RaspberryPi.B(false);
			leftports='ethernet,usb1';
			av_ports='audiojackcylinder,rcajack';
			leftclearance='ethernetClearance,usb10Clearance,usb11Clearance';
			break;
			
		case 'b_v2':
			BPlus = RaspberryPi.B(true);
			mounting = RaspberryPi.BMounting;
			av_ports='audiojackcylinder,rcajack';
			break;
			
		case 'bplus':
			BPlus = RaspberryPi.BPlus(false);
			mounting = RaspberryPi.BPlusMounting;
			usb2 = true;
			av_ports='avjackcylinder';
			break;
			
		case 'b3':
			BPlus = RaspberryPi.BPlus(true);
			mounting = RaspberryPi.BPlusMounting;
			usb2 = true;
			av_ports='avjackcylinder';
			break;

		default:
	}
	if (usb2) {
		usb2ports = ',usb2';
		usb2clearance=',usb20Clearance,usb21Clearance';
		BPlus.add(RaspberryPi.Parts.UsbWifiAdapter(BPlus.parts.usb2, 0).enlarge([1, 1, 1]), 'usb20Clearance', true);
		BPlus.add(RaspberryPi.Parts.UsbWifiAdapter(BPlus.parts.usb2, 1).enlarge([1, 1, 1]), 'usb21Clearance', true);
	}
	BPlus.add(RaspberryPi.Parts.UsbWifiAdapter(BPlus.parts.usb1, 0).enlarge([1, 1, 1]), 'usb10Clearance', true);
	BPlus.add(RaspberryPi.Parts.UsbWifiAdapter(BPlus.parts.usb1, 1).enlarge([1, 1, 1]), 'usb11Clearance', true);
    BPlus.add(BPlus.parts.ethernet.color('blue').snap(BPlus.parts.ethernet, 'x', 'outside-'), 'ethernetClearance', true);
    var center = BPlus.parts.mb.calcCenter('xy');
    BPlus.map(function (part) {
        return part.translate(center);
    });

    var topsupports = mounting.pads(BPlus.parts.mb, {
        height: 9
    }).map(function (part) {
        return part.fillet(-1, 'z+').color('blue');
    });

    var bottomsupports = mounting.pads(BPlus.parts.mb, {
        height: 3,
        snap: 'outside+'
    }).map(function (part) {
        return part.fillet(-1, 'z-').color('red');
    });

    var spacer = Parts.Cube([2, 2, 2]).snap(BPlus.parts.mb, 'x', 'outside-');
    var interior = union([
        topsupports.combine(),
        bottomsupports.combine(),
        BPlus.combine('mb'),
        spacer
    ]);

    var boxsize = interior.enlarge(1, 1, 0).size();
    var chamfer = thickness / 2;
    var box = Boxes.Rectangle(boxsize, thickness, function (box) {
        return box
            .rotateY(90)
            .chamfer(chamfer, 'z+')
            .chamfer(chamfer, 'z-')
            .rotateY(-90)
            .chamfer(chamfer, 'z+')
            .chamfer(chamfer, 'z-')
            .align(interior, 'xyz');
    });

    box = Boxes.RabettTopBottom(box, thickness, 0.3, {
        removableTop: true,
        removableBottom: false
    });

    var leftcutouts = BPlus.combine('ethernet,usb1,'+av_ports+usb2ports, {}, function (part) {
        return part.enlarge([1, 1, 1]);
    }).union(BPlus.combine('ethernetClearance,usb10Clearance,usb11Clearance'+usb2clearance));



    var bottomcutouts = union(BPlus.combine('microusb,hdmi,'+av_ports, {}, function (part) {
        return part.enlarge([1, thickness + 1, 1]).translate([0, -thickness, 0]);
    }));

    var screw = Parts.Hardware.FlatHeadScrew(5.38, 1.7, 2.84, 12.7 - 1.7).combine('head,thread');

    var screws = bottomsupports.clone(function (part) {
        return screw.align(part, 'xy').snap(box.parts.bottom, 'z', 'inside-');
    });

    if (params.text.length > 0) {
        var uselabel = true;
        var labelarea = topsupports.combine().enlarge([-15, -5, 0]);
        var labelsize = labelarea.size();
        var label = util.label(params.text, 0, 0, 3, thickness + 1)
            .snap(box.parts.top, 'z', 'inside+')
            .align(labelarea, 'xy')
            .fit([labelsize.x, labelsize.y, 0], true)
            .translate([0, 0, 0.5]);

        var connectorarea = label.size();

        var connector = Parts.Cube([connectorarea.x, 1, 1])
            .align(label, 'x')
            .snap(label, 'y', 'outside+')
            .snap(box.parts.top, 'z', 'inside+')
            .translate([0, 0, -thickness / 2]);

        var connectors = union([0.2, 0.4, 0.6, 0.8].map(function (position) {
            return connector.translate([0, connectorarea.y * position, 0]);
        }));
    }
	
	if (params.logo) {
        var uselogo = true;
        var logoarea = topsupports.combine().enlarge([-15, -5, 0]);
        var logosize = logoarea.size();
        var logo_3d = logo().extrude({offset:[0,0,params.thickness+1]})
            .snap(box.parts.top, 'z', 'inside+')
            .align(logoarea, 'xy')
            .fit([logosize.x * 0.75, logosize.y * 0.75, 0], true)
            .translate([-6, -2, 0.05]);
	}


    var ribbonhole = Parts.Board(2, 17, 1, thickness * 2);

    var parts = {
        top: function () {
            return box
                .combine('top')
                .union(topsupports.combine().snap(box.parts.top, 'z', 'outside+'))
                .subtract(leftcutouts.unionIf(label, uselabel))
                .subtract(leftcutouts.unionIf(logo_3d, uselogo))
                .subtractIf(function () {
                    return BPlus.parts.gpio.snap(box.parts.top, 'z', 'inside+').enlarge([2, 1, thickness * 3]);
                }, params.gpio)
                .subtractIf(ribbonhole.snap(box.parts.top, 'z', 'inside+').align(BPlus.parts.camera, 'xy'), params.camera)
                .subtractIf(function () {
                    return ribbonhole.snap(box.parts.top, 'z', 'inside+').align(BPlus.parts.display, 'xy');
                }, params.display)
                .unionIf(connectors, uselabel)
                .color('blue').subtract(screws.combine(undefined, {}, function (screw) {
                    return screw.enlarge([-0.6, -0.6, 4]);
                }));
        },
        bottom: function () {
            return box
                .combine('bottom')
                .subtract(union([bottomcutouts, leftcutouts, BPlus.parts.microsd.enlarge([1, 2, 1]).translate([-thickness, 0, 0])]))
                .union(bottomsupports.combine())
                .subtract(RaspberryPi.Parts.MicroUsbPlug(BPlus.parts.microusb).combine('plug').enlarge([1, 0, 1]).translate([0, 1, 0]))
                .color('red')
                .subtract(screws.combine(undefined, {}, function (screw) {
                    return screw.enlarge([0.42, 0.42, 0]);
                }));
        },
        assembled: function () {
            return union([BPlus.combine(), parts.top(), parts.bottom()]);
        },
        board: function () {
            return BPlus.combine();
        }
    };

    return parts[params.part]();
}

// ********************************************************
// Other jscad libraries are injected here.  Do not remove.
// Install jscad libraries using NPM
// ********************************************************
// include:js
// endinject
