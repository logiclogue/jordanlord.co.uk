---
title: Advanced Graphics Layer
draft: true
---

# Introduction

This article introduces a simple way to encode advanced graphics in the browser.
It'll be inspired by the graphics of retro consoles like the NES and GameBoy.
There will be two types of graphics, objects and tiled. Objects will be
individually programmable. Tiles will be scrollable. Both objects and tiles will
read from the same sprite sheet and palette table. Objects and tiles will be
scrollable. There'll be one object layer. There'll be two tiled layers, a
background and a window.

# Example

[ez_susa_screen id=1]

# Specification

- Memory map

```
$0000-$0fff     $1000   Zero page
$1000-$1fff     $1000   System registers
$2000-$2fff     $1000   Sprite table A
$3000-$3fff     $1000   Sprite table B
$4000-$4fff     $1000   Sprite table C
$5000-$5fff     $1000   Sprite table D
$6000-$6fff     $1000   Object memory
$7000-$7fff     $1000   Background memory
$8000-$8fff     $1000   Window memory
$9000-$ffff     $7000   Unallocated

TODO - mouse selection
TODO - collision detection
```

- System registers

```
CTRL        $1000   ---- ---M
STATUS      $1001   DDDD DDDD
OSCRLX      $1002   XXXX XXXX XXXX XXXX     Object scroll X
OSCRLY      $1004   YYYY YYYY YYYY YYYY     Object scroll Y
BSCRLX      $1006   XXXX XXXX XXXX XXXX     Background scroll X
BSCRLY      $1008   YYYY YYYY YYYY YYYY     Background scroll Y
WSCRLX      $100a   XXXX XXXX XXXX XXXX     Window scroll X
WSCRLY      $100c   YYYY YYYY YYYY YYYY     Window scroll Y
SWIDTH      $100e   WWWW WWWW WWWW WWWW     Screen width
SHIGHT      $1010   HHHH HHHH HHHH HHHH     Screen height
TICKKK      $1012   TTTT TTTT TTTT TTTT     Current tick, increments
MILLIS      $1014   MMMM MMMM MMMM MMMM     Last tick milliseconds
MOUSEX      $1016   XXXX XXXX XXXX XXXX     Mouse X position
MOUSEY      $1018   YYYY YYYY YYYY YYYY     Mouse Y position
KEYPRA      $101a   AAAA AAAA               Key press A
KEYPRB      $101b   BBBB BBBB               Key press B

PALET0      $1020   BBBB AAAA BBBB CCCC     Palette 0 (sprite)
PALET1      $1022   BBBB AAAA BBBB CCCC     Palette 1 (sprite)
PALET2      $1024   BBBB AAAA BBBB CCCC     Palette 2 (sprite)
PALET3      $1026   BBBB AAAA BBBB CCCC     Palette 3 (sprite)
PALET4      $1028   BBBB AAAA BBBB CCCC     Palette 4 (sprite)
PALET5      $102a   BBBB AAAA BBBB CCCC     Palette 5 (sprite)
PALET6      $102c   BBBB AAAA BBBB CCCC     Palette 6 (sprite)
PALET7      $102e   BBBB AAAA BBBB CCCC     Palette 7 (sprite)

PALET8      $1030   BBBB AAAA BBBB CCCC     Palette 8 (background)
PALET9      $1032   BBBB AAAA BBBB CCCC     Palette 9 (background)
PALETa      $1034   BBBB AAAA BBBB CCCC     Palette a (background)
PALETb      $1036   BBBB AAAA BBBB CCCC     Palette b (background)
PALETc      $1038   BBBB AAAA BBBB CCCC     Palette c (background)
PALETd      $103a   BBBB AAAA BBBB CCCC     Palette d (background)
PALETe      $103c   BBBB AAAA BBBB CCCC     Palette e (background)
PALETf      $103e   BBBB AAAA BBBB CCCC     Palette f (background)
```

- Object memory

Object memory is 4096 bytes total, comprising of an array of 512 elements, 8 bytes
in size. Each consecutive 8 bytes corresponds to an object. Objects are rendered
in order of the array, later elements will overlap. The renderer will stop
drawing when it receives an address of 0.

```
XPOS    0   XXXX XXXX XXXX XXXX     X position of the sprite
YPOS    2   YYYY YYYY YYYY YYYY     Y position of the sprite
ATTR    4   7654 3210               Attribute register (TODO - 2 bytes, for text, sprite sizes etc)
            |||| ||||
            |||| |+++ Palette of sprite
            |||+-+--- Selection (00: default 8x8; 01: right 4x8; 10: left 4x8; 11: double 8x16)
            ||+------ Priority (0: in front of background; 1: behind background)
            |+------- Flip sprite horizontally
            +-------- Flip sprite vertically
ADDR    6   AAAA AAAA AAAA AAAA     Sprite address
```

- Sprite table

The sprite table is 4096 bytes total. It's a 16x16 grid of 2x 8 byte chunks.
Each byte represents a row of the sprite. The sprite table is used by both
object memory and background memory.

```
    0   1   2   3   4   5   6   7   8   9   a   b   c   d   e   f
00
10
20
30
40
50
60
70
80
90
a0
b0
c0
d0
e0
f0
```

The sprite itself is composed of 2x 8 byte rows. Each byte represents a row of
the 8x8 sprite. The first 8 bytes represent the first bit in the palette table,
the second bit represents the latter.

```
0   0000 0000       8   0000 0000
1   0000 0000       9   0000 0000
2   0000 0000       a   0000 0000
3   0000 0000       b   0000 0000
4   0000 0000       c   0000 0000
5   0000 0000       d   0000 0000
6   0000 0000       e   0000 0000
7   0000 0000       f   0000 0000
```

- Background memory

The background memory is 4096 bytes in size. It is a 64x64 grid of sprites. It
wraps around defined by the background scroll registers.

```
SPRITE  0   NNNN NNNN   Index of the sprite
ATTR    0   7654 3210               Attribute register (TODO - 2 bytes, for text, sprite sizes etc)
            |||| ||||
            |||| ||++ Sprite sheet selection
            |||+ ++-- Palette of sprite
            |||
            ||+------ TODO
            |+------- Flip sprite horizontally
            +-------- Flip sprite vertically
```

- Window memory

Window memory is the exact same structure as the background memory. It sits on
top of all sprites and is rendered last.

- Palettes

A palette define the colours that are given to sprites. Each palette is a 4 byte
sequence, where the first byte defines the brightness. If the brightness is 0,
then all sprite values of 0 are considered transparent. There are 16 palettes,
the first 8 are used for sprites, the second 8 are used for backgrounds.
