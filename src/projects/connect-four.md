---
github: logiclogue/connect-four
platform: C
title: Connect Four
publishDate: 2017-03-20
---

A command line Connect Four engine.

```
0123456
.......
.......
.......
...O...
...X...
...XO..
```

## Goals

- To create a polymorphic C program.
- To provide a low level Connect Four engine.
- To create a command line Connect Four game.

## To do

- Create a naughts-and-crosses game
- Parse board positions as an argument
- Create a separate program which just validates whether there is a connect four
- Create an AI bot

## Arguments

```
--columns  <number>  Columns on the board (default 7)
--rows     <number>  Rows on the board (default 6)
--length   <number>  Length of line required to win (default 4)
```

## Example

### Play a standard game

Command:

`./build/main`

Output:

```
7, 6

0123456
.......
.......
.......
.......
.......
.......

Column to move: 
```

### Create a bigger board

Command:

`./build/main --columns 10 --rows 10`

Output:

```
10, 10

0123456789
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........

Column to move: 
```

### Connect Five!

Command:

`./build/main --columns 10 --rows 10 --length 5`

Output:

```
10, 10

0123456789
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........

Column to move: 
```

## License

Licensed user the GNU GPLv3.
