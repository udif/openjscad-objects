Openjscad objects
=================
These are several objects designed using OpenJSCad.org and the openjscad-utils library.

Some of the files here are taken from other repositories, but since there are sevral files, each from a different repository, we cannot simply fork one repository.

The files jscad-boxes.jscad, jscad-utils-color.jscad, jscad-utils-parts.jscad, jscad-utils.jscad Are forked from https://github.com/johnwebbcole/jscad-utils

The file jscad-raspberrypi.jscad is forked from https://github.com/johnwebbcole/jscad-raspberrypi

The file kodi_logo.jscad was created fresh by taking http://labs.koenklaren.nl/kodi-logo/kodi-logo.svg and importing it into OpenJSCAD.org

The file picase.jscad is forked from https://github.com/johnwebbcole/picase

Raspberry Pi case
-----------------
Please drag all the jscad-*.jscad files, kodi_logo.jscad and picase.jscad and drop them on https://openjscad.org/
You can then change various parameters and render which part you want.

### List of improvements over original picase:
1. It is possible to add an SVG Logo on the box top cover
2. It is possible to control the Box height
3. Added support for Older Raspberry Pi B
4. Added additional views (board-only, board with plugs, etc.)
5. Simplified logic, for example: list of cutouts is prepared once, then subtracted from box, and only then the box is split into top & bottom. This saves us from separating the cutouts into top & bottom

### TODO
1. Convert the specialized board layout into a JSON file for each new board, with each board built from a standard PCB plus standard components (USB, ethernet, hdmi, etc), all described by a JSON file.
This should allow printing boxes for new board in 15 minutes.
2. Add a generic mechanism for adding box mounts (for example VESA mounts) to a box without being explicit to a specific box model.

Flex grid
---------
A parametrized pattern to create flexible surfaces even when 3D printing using rigid materials.
Based on:
http://lab.kofaktor.hr/en/portfolio/super-flexible-laser-cut-plywood/
http://www.instructables.com/id/Flexible-3D-Printing/

Other parts:
------------
othello.jscad - A small piece for playing Reverse/Othello. Print two of these, one in black and one in white, and glue back to back. `
yi-mount.jscad - An adapter from the Yi dash camera to a an arm with a Vaccum  attachment.
