---
title: Creating a Football Statistical Model
draft
---

This article is going to be part of a multipart series. The end goal is to write
a football score simulation program.

The first place to start is creating a statistical model. From the statistical
model, we can emulate matches.

We're going to weight the football teams using the Elo rating system. The reason
for this is it's easy to find the Elo ratings of real life football teams from
websites like **clubelo.com**(?) and **the website which provides ratings
for national teams**.

The Elo rating system will need a few extensions before we can use it to
properly model the outcome of football matches. First of all, Elo only predicts
wins and losses, not draws. This makes sense as the draw percentage depends
heavily on the game.

Another goal of our statistical model will be to predict the scores of football
matches. This is another big challenge as it goes well beyond what Elo provides.

Although in later articles I'm going to be using OCaml for the implementation,
in this article I'll be using Haskell as a tool to help me quickly evaluate
results.

## Modelling Draws

The first task is to create an expected value function for draws. I'm going to
use results from the 2017/18 Premier League season as posted below.

## Premier League 2017/18

| Team | W  | D  | L  | Rating |
|------|----|----|----|--------|
| MCI  | 32 |  4 |  2 |   1316 |
| MUN  | 25 |  6 |  7 |   1189 |
| TOT  | 23 |  8 |  7 |   1168 |
| LIV  | 21 | 12 |  5 |   1168 |
| CHE  | 21 |  7 | 10 |   1116 |
| ARS  | 19 |  6 | 13 |   1063 |
| BUR  | 14 | 12 | 12 |   1021 |
| EVE  | 13 | 10 | 15 |    979 |
| LEI  | 12 | 11 | 15 |    968 |
| NEW  | 12 |  8 | 18 |    937 |
| CRY  | 11 | 11 | 16 |    947 |
| BOU  | 11 | 11 | 16 |    947 |
| WHU  | 10 | 12 | 16 |    937 |
| WAT  | 11 |  8 | 19 |    916 |
| BHA  |  9 | 13 | 16 |    926 |
| HUD  |  9 | 10 | 19 |    895 |
| SOU  |  7 | 15 | 16 |    905 |
| SWA  |  8 |  9 | 21 |    863 |
| STK  |  7 | 12 | 19 |    874 |
| WBA  |  6 | 13 | 19 |    863 |

I'm using this formula to calculate the elo ratings:

```
f (wins, draws, losses) = (total_elo + 400 * (wins - losses)) / games
```

Which reduces to in our case:

```
f (wins, draws, losses) = 1000 + (400 / 38) * (wins - losses)
```

## Elo Lookup Table

For our calculations, it'll be important for this to be in a nice lookup table.

```
type Rating = Int
type Team = (String, Rating)

teams :: [Team]
teams = [
    ("MCI", 1316),
    ("MUN", 1189),
    ("TOT", 1168),
    ("LIV", 1168),
    ("CHE", 1116),
    ("ARS", 1063),
    ("BUR", 1021),
    ("EVE", 979),
    ("LEI", 968),
    ("NEW", 937),
    ("CRY", 947),
    ("BOU", 947),
    ("WHU", 937),
    ("WAT", 916),
    ("BHA", 926),
    ("HUD", 895),
    ("SOU", 905),
    ("SWA", 863),
    ("STK", 874),
    ("WBA", 863)]
```

## Past Matches

Here are all the results for the 2017/18 Premier League season in a format that
we can work with in Haskell:

```
type Match = (String, String, Int, Int)

matches :: [Match]
matches = [
    ("ARS", "BOU", 3, 0),
    ("ARS", "BHA", 2, 0),
    ("ARS", "BUR", 5, 0),
    ...
    ("WHU", "WBA", 2, 1)]
```

The full listing can be found in the [football.lhs](./football.lhs) file.

## Logistic Regression

With this data, we're going to plot draws against absolute rating difference.

First of all, we need a function which will be able to tell whether a match is a
draw or not.

```
isMatchDraw :: Match -> Bool
isMatchDraw (_, _, homeGoals, awayGoals) = homeGoals == awayGoals
```

Then we need a function to give us the match rating difference:

```
matchRatingDiff :: [Team] -> Match -> Rating
matchRatingDiff teams (homeTeam, awayTeam, _, _) = ratingDifference where

    ratingDifference :: Rating
    ratingDifference = homeRating - awayRating

    homeRating :: Rating
    homeRating = getRating homeTeam teams + 75

    awayRating :: Rating
    awayRating = getRating awayTeam teams
```

It's now possible to write a function which does both:

```
matchDrawWithRating :: [Team] -> Match -> (Rating, String)
matchDrawWithRating teams match = (ratingDiff, isDraw) where

    ratingDiff :: Rating
    ratingDiff = abs $ matchRatingDiff teams match

    isDraw :: Bool
    isDraw = isMatchDraw match
```

By mapping `matchDrawWithRating teams` over `matches`, it's possible to get all
of the data we need.

Now we need to understand how Logistic regression works so that we can create a
logistic model for the rating against draws. Then we should be able to fit that
into Elo's model.

A logistic function is of the form:

```
f(x) = L / (1 + e^(-k(x - x0)))
```

Where `L` is the maximum value, which will be 1 in our case. `e` is Euler's
number. `k` is the 'logistic growth rate'. Finally, `x0` is the x-value of the
sigmoid midpoint.

So the only values we need to find are `k` and `x0`.
