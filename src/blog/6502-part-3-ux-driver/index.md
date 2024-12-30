---
title: 6502 Part 3 - Drawing 4x8 Fonts
publishDate: 2024-12-15
draft: true
---

# Introduction

Sticking with our ZX Spectrum video mode, we need a way to draw text onto the
screen. Personally, I've always found the 8x8 fonts to not make good use of
screen space. Therefore, we're going to draw a 4x8 font.

# Requirements

A way of providing user input: mouse/clicking and text. A way of providing
output: text.

The interface must be incredibly simple, such that it's easy to build
applications with.

# Text

The way that we will achieve having text is through a 4x8 font.

- TODO - currently copied in @ to G in the fonts for testing, then next going to
    try and print it to the screen properly
    - not sure whether to have a text buffer which dictates where text is on the
        screen, this sounds good but it's probably going to take up a lot of
        memory
    - the other option is to have a text object list
    - I've managed to get the character drawing on the screen, however, it seems
        like the screen is now drawing onto odd lines, which is odd


- ripping off something from the internet and using ChatGPT to transcribe the
    font
- drawing a character
- drawing text
    - pascal strings
- draw byte
- drawing numbers

LSB      MSB
rrrccccc 010aalll

addr_x = 000ccccc
addr_y = 000aarrr

font

87654321 -> 00000087 65432000

# Buttons

[zx_screen id=1]

[sixfiveohtwo src="code.asm" id=1]
