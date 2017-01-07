---
github: logiclogue/gravity-simulator
publishDate: 2016-11-05
title: Gravity Simulator (C)
---

This program is designed to simulate planets/particles in two dimensional space.
It's written in C using OpenGL and SDL.

The goal of this project was to recreate my original ![Gravity
Simulator](http://jordanlord.co.uk/projects/gravity-simualtor-javascript) in C.
With C being much closer to the hardware, better performance will be achieved.


## Requirements

Make sure you have `sdl2`, `make`, and `gcc` installed on your computer.


## Installation

```
git clone https://github.com/logiclogue/gravity-simulator
cd gravity-simulator
make
```

The program will begin compiling. Once compilation has finished, the binary will
be in the `build/` folder. In order to run the program, type `./build/main`.
Assuming you're on a Unix machine. It's only been tested on Arch Linux.
Modification of the SDL and OpenGL header paths may be required to execute on
other systems.

The program currently doesn't have much functionality. To change the initial
locations of the planets, you'll have to edit `src/main.c` and recompile.


## License

MIT License
