---
title: Writing a Football Simulation
draft
---

In this article, I'm not going to go into massive detail into writing a really
in depth football simulation. Instead, I'm going to start with the very basics.
By this, I mean I'm going to just generate the outcome of the match: a win, a
draw, or a loss. From the outcome, I'll be able to generate the score and hence
generate more and more information about the football match.

I'm going to weight the football teams using the Elo rating system. The reason
for this is it's easy to find the Elo ratings of real life football teams from
websites like **clubelo.com**(?) and **the website which provides ratings for
national teams**. Also, it's easy to reverse engineer the formulas to randomly
output match results rather than create a prediction.

The programming language that I'll be using is OCaml, using BuckleScript to
compile to JavaScript for NodeJS. This will not be a tutorial for OCaml, nor
will I explain the features of the language.

Okay, so first of all, we want to generate a football match outcome from a 
