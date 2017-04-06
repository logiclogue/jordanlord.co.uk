---
github: logiclogue/seeded-random-node
platform: Node
npm: seeded-random 
publishDate: 2016-06-29
title: Seeded Random
---

Node package that allows you to generate seeded random numbers for your cli or
web applications.

## Installing

### CLI

`npm install -g seeded-random`

### Node project

`npm install --save seeded-random`

## Examples

### CLI

Generating a random decimal number

`$ seeded-random -d`

Generating a random decimal number from a seed

`$ seeded-random -d -s thisisaseed`

`0.9044537395238876`

Generating a random integer within a range from a seed

`$ seeded-random -r 1,6 -s thisisaseed`

`2`

Omitting the seed will result it a non-seeded random number; it will just be
generated as normal.

### JavaScript

Generating a random decimal number from a seed

```
var random = require('seeded-random');

console.log(random.decimal('thisisaseed'));
```

Generating a random integer within a range from a seed

```
var random = require('seeded-random');

console.log(random.range('thisisaseed', 1, 6));
```

Selecting a random array element

```
var random = require('seeded-random');

console.log(random.element('thisisaseed', ['heads', 'tails']));
```
