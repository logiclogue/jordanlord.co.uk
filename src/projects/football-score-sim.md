---
npm: https://www.npmjs.com/package/football-score-sim
github: https://github.com/logiclogue/football-score-sim
publishDate: 2016-09-30
title: Football Score Simulator
---

A simple package which generates realistic
football (soccer) scores. It does this using
normal distribution and the given elo ratings.

## Installation

`npm install --save football-score-sim`

## Example
```
var football = require('football-score-sim');
var Team = football.Team;
var Match = football.Match;
var MatchOutputter = football.MatchOutputter;


var derby = new Team({
    name: 'Derby County',
    rating: 1544
});
var united = new Team({
    name: 'Manchester United',
    rating: 1794
});

var match = new Match({
    teamA: derby,
    teamB: united,
    extraTime: true,
    penalties: true,
    seed: 'example'
});

var outputter = new MatchOutputter({
    match: match
});

match.simulate();

console.log(outputter.basicScore());
```
output:
`Derby County 2-2 Manchester United (aet) (5-3)`

## License

This project is licensed under the MIT license
