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

Okay, so first of all, to generate a match outcome from ratings, I'll be using
the elo formula for finding the expected value. Then from that, using a random
number generator to pick either win, draw, or loss.

Based on the 2017-18 Premier League season, draws occurred 26% of the time. This
will be useful later on. Elo's system doesn't give us probabilities for draws
occurring.

Let's start with the simplest part of the system, the rating. We're going to
create `Rating.mli` which will define the rating type as a float.

```
type t = float
```

From here, we're going to define all of the elo functions that we'll need, let's
start with the interface `Elo.mli`

## Probability Mass Function

The probability mass function will help us simulate the outcomes of the matches.
Our Elo model will give us the probability of different outcomes occurring.

Let's keep it simple and not consider draws. Say Derby County are
facing their local East Midlands rivals Nottingham Forest. At this moment in
time, let's assume they both have the same rating of 1550. Using the expected
Elo rating formula, this will give us the following probability mass function:

Derby win ↦ 0.37
Draw ↦ 0.26
Forest win ↦ 0.37

Now to put this into code. We're going to represent the PMF as a list of tuples
rather than a function, this will become clearer why later on.

```
let pmf = [(Win, 0.37), (Draw, 0.63), (Loss, 0.37)]

let f x pmf = List.find (fun (y, _) -> x == y) pmf |> snd
```

## Probability Density Function

To use a random number to simulate the outcome of the match, we'll have to
calculate the probability density function from the probability mass function
which we had previously.

Derby win ↦ 0.37
Draw ↦ 0.63
Forest win ↦ 1

Now using our previous definition of the PMF, we can compute the PDF easily.

## Quantile Function

The final step is to calculate the *quantile function* from our *probability
density function*. The quantile function is just the inverse of the probability
density function.

All we have to do is swap the arrows around.

0 .. 0.37 ↦ Derby win
0.37 .. 0.63 ↦ Draw
0.63 .. 1 ↦ Forest win

## Simulating Outcomes

Now by picking a random number before 0 and 1, we can simulate the outcome of
the match, using our quantile function.

The random number generator chose: 0.29.

quantile function(0.29) ↦ Derby win

Derby have won!

Now you can start to see how this works.
