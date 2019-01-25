---
title: Football Simulation Part 1: Collecting Data
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
wins and losses, not draws. This makes sense as the drawing odds depend heavily
on the game.

Another goal of our statistical model will be to predict the scores of football
matches. This is another big challenge as it goes well beyond what Elo provides.

Although in later articles I'm going to be using OCaml for the implementation,
in this article I'll be using Haskell as a tool to help me quickly evaluate
results and R to do the statistical calculations.

## Modelling Wins

The first task is to create an expected value function for wins. I'm going to
use results from the 2017/18 Premier League season as posted below.

We're going to create our model based off the results from the 2017/18 Premier
League season.

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

Which reduces to this, in our case:

```
f (wins, draws, losses) = 1000 + (400 / 38) * (wins - losses)
```

This will be no good though. There is always a home advantage (or an away
disadvantage) in football. So when analysing the results, we want to take that
into account. So we want the home table and the away table and from that
calculate the team's home rating and away rating as we did before.

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

## Calculating Home And Away Tables

```
type Record = (Int, Int, Int) -- (Wins, Draws, Losses)

isWin :: Match -> Bool
isWin (_, _, homeGoals, awayGoals, _) = homeGoals > awayGoals

isDraw :: Match -> Bool
isDraw (_, _, homeGoals, awayGoals, _) = homeGoals == awayGoals

isLoss :: Match -> Bool
isLoss (_, _, homeGoals, awayGoals, _) = homeGoals < awayGoals

getHomeTeam :: Match -> String
getHomeTeam (homeTeam, _, _, _, _) = homeTeam
```

Now we want to create a home table and away table. We'll represent this as type
`[(String, Record)]`. So it'll be an associative list. First, it'll be easier to
map each result to a non compressed list of `[(String, Record)]`. So there will
be many teams with `Record`s that only have one value.

```
matchToRecord :: Match -> (String, Record)
matchToRecord match
    | isWin  match = (getHomeTeam match, (1, 0, 0))
    | isDraw match = (getHomeTeam match, (0, 1, 0))
    | isLoss match = (getHomeTeam match, (0, 0, 1))
```

We can create a list of records by doing `map matchToRecord matches`. But the
question is, how do we fold this into a table?

We're going to use Haskell's `Data.Map.String`

```
import qualified Data.Map.Strict as Map
```

Our function, will have to be of type, `Match -> (String, Record)`.

## Writing To A CSV
