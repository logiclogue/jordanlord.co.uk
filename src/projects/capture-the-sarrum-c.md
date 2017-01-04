---
github: logiclogue/capture-the-sarrum-c
publishDate: 2016-09-29
title: Capture the Sarrum (C)
---

A port of 'Capture the Sarrum' written in the C programming language. The
original was from the AQA COMP1 Summer 2015 examination and was written in
Visual Basic. The goal of this project was to modularise the code and make it
portable (hence the use of C).

Having not done much C programming before this writing this program, I wanted to
test and improve my C knowledge.


## Installation

Requires `gcc` and `make`.

Type in the following commands:
```
git clone https://github.com/logiclogue/capture-the-sarrum-c.git
cd capture-the-sarrum-c
make
./build/main
```


## Rules

### The Board

<pre>
    _________________________
1   |BG|BE|BN|BM|BS|BN|BE|BG|
    _________________________
2   |BR|BR|BR|BR|BR|BR|BR|BR|
    _________________________
3   |  |  |  |  |  |  |  |  |
    _________________________
4   |  |  |  |  |  |  |  |  |
    _________________________
5   |  |  |  |  |  |  |  |  |
    _________________________
6   |  |  |  |  |  |  |  |  |
    _________________________
7   |WR|WR|WR|WR|WR|WR|WR|WR|
    _________________________
8   |WG|WE|WN|WM|WS|WN|WE|WG|
    _________________________

     1  2  3  4  5  6  7  8
</pre>

### The Pieces

Two characters are used to represent a piece on the board. The first character,
of the two, represents the piece's colour. Furthermore, the second character
represents the piece's class.
