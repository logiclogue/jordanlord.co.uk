---
title: 6502 Part 4 - Custom Video Layer
publishDate: 2025-01-04
draft: true
---

# Introduction

It's been fun working with the ZX Spectrum's video layer. However, we've come
across limitations where it has become cumbersome to write in. If we want to
build some more advanced applications such as games, we'll need a better
solution. To do this, we'll build our own video layer. It'll still be a 256x192
display, but controlled by something more akin to the NES's Pixel Processing
Unit (PPU). The idea is that it will give us smoother animations and easier
control over graphics in general.

# Requirements

- Graphics registers

```
CTRL        $2000   ---- ---M
STATUS      $2001   DDDD DDDD
OBJPTR      $2002   AAAA AAAA AAAA AAAA
GRAPTR      $2004   AAAA AAAA AAAA AAAA
BSCRLX      $2006   XXXX XXXX
BSCRLY      $2007   YYYY YYYY
WSCRLX      $2008   XXXX XXXX
WSCRLY      $2009   YYYY YYYY
```

- Object memory

Object memory is 256 bytes total, comprising of an array of 64 elements, 4 bytes
in size. Each consecutive 4 bytes corresponds to an object.

```
XPOS    1   XXXX XXXX   X position of the sprite
YPOS    2   YYYY YYYY   Y position of the sprite
ATTR    3   7654 3210   Attribute register
            |||| ||||
            |||| |+++ Palette of sprite
            |||+-+--- Selection (00: default 8x8; 01: right 4x8; 10: left 4x8; 11: double 8x16)
            ||+------ Priority (0: in front of background; 1: behind background)
            |+------- Flip sprite horizontally
            +-------- Flip sprite vertically
INDX    4   NNNN NNNN   Sprite index in the sprite table
```

- Graphics memory

Graphics memory is in total 8kb, comprising of a sprite table, background table,
and window array.

```
$0000-$0fff     $1000   Sprite table
$1000-$13ff     $0400   Background table
$1400-$14ff     $0100   Background attribute table
$1500-$18df     $02c0   Window array
$18c0-$18ff     $0040   Palettes
```

- Sprite table

The sprite table is 4kb total. It's a 16x16 grid of 2x 8 byte chunks. Each byte
represents a row of the sprite. The sprite table is used by both object memory
and background memory.

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

- Background table

The background table is a 32x32 grid of sprites. It wraps around defined by the
scroll registers.

- Background attribute table

Defines the attributes for each background 2x2 group. An attribute is a byte
that defines the palette for which that 2x2 sprite group will use.

- Window array

TODO - out of scope of today

- Palettes

A palette define the colours that are given to sprites. Each palette is a 4 byte
sequence, where the first byte is ignored. There are 16 palettes, the first 8
are used for sprites, the second 8 are used for backgrounds.

# Text

[ez_pentagon_screen id=1]

[sixfiveohtwo src="code.asm" id=1]
