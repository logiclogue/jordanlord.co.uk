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

The full listing can be found in the [football.lhs](./football.lhs) file, along
with all code from this article.

## Calculating Home And Away Tables

```
newtype Record = Record (Int, Int, Int) -- (Wins, Draws, Losses)

isWin :: Match -> Bool
isWin (_, _, homeGoals, awayGoals, _) = homeGoals > awayGoals

isDraw :: Match -> Bool
isDraw (_, _, homeGoals, awayGoals, _) = homeGoals == awayGoals

isLoss :: Match -> Bool
isLoss (_, _, homeGoals, awayGoals, _) = homeGoals < awayGoals

getTeam :: Match -> String
getTeam (homeTeam, _, _, _, _) = homeTeam
```

Now we want to create a home table and away table. We'll represent this as type
`[(String, Record)]`. So it'll be an associative list. First, it'll be easier to
map each result to a non compressed list of `[(String, Record)]`. So there will
be many teams with `Record`s that only have one value.

```
matchToRecord :: Match -> (String, Record)
matchToRecord match
    | isWin  match = (getTeam match, Record (1, 0, 0))
    | isDraw match = (getTeam match, Record (0, 1, 0))
    | isLoss match = (getTeam match, Record (0, 0, 1))
```

We can create a list of records by doing `map matchToRecord matches`. But the
question is, how do we fold this into a table?

We're going to use Haskell's `Data.Map.Strict` library and treat the table as a
`Map` of `Map String Record`.

```
import qualified Data.Map.Strict as Map
```

To create a home table, it'll be best to start with an empty map `Map.empty` and
fold the records into that. It'll be a map of type `Map.Map String Record`, as
we want the team name (`String`) to be the key and the team's records (`Record`)
to be the associated value.

We'll create a `Monoid` and `Semigroup` instance for records as that'll give us
empty records and a nice function to combine them.

```
instance Monoid Record where

    mempty = Record (0, 0, 0)

instance Semigroup Record where

    (<>)
        (Record (winsA, drawsA, lossesA))
        (Record (winsB, drawsB, lossesB)) =
            Record (winsA + winsB, drawsA + drawsB, lossesA + lossesB)
```

Now we can use `Map.fromListWith` to create our table.

```
homeTable :: Map.Map String Record
homeTable = Map.fromListWith (<>) (map matchToRecord matches)
```

Here is a more generic function for calculating tables from results:

```
createTable :: [Match] -> Map.Map String Record
createTable = Map.fromListWith (<>) . map matchToRecord
```

To get the away table, we'll need to use `createTable` with the away results.

```
awayMatch :: Match -> Match
awayMatch (homeTeam, awayTeam, homeGoals, awayGoals, isHome) =
    (awayTeam, homeTeam, awayGoals, homeGoals, not isHome)
```

Now by using this function, we can calculate the away table:

```
awayTable :: Map.Map String Record
awayTable = (createTable . map awayMatch) matches
```

We can even get the full table by first getting the home and away match from the
home match:

```
homeAndAway :: Match -> [Match]
homeAndAway match = [match, awayMatch match]
```

Then flat mapping across the matches and applying it to `createTable` gives us
the full Premier League table:

```
fullTable :: [Match] -> Map.Map String Record
fullTable = createTable . concatMap homeAndAway
```

## Tables To Ratings

The goal is now to use our table of records to create a lookup table of ratings.

Using the formula from before:

```
f (wins, draws, losses) = 1000 + (400 / 38) * (wins - losses)
```

A Haskell function can be created that works with our `Record` data type:

```
type Rating = Int

recordToRating :: Record -> Rating
recordToRating (Record (wins, draws, losses)) = rating where
    
    rating :: Rating
    rating = 1000 + round ((400 / fromIntegral totalGames) * diff)

    totalGames :: Int
    totalGames = wins + draws + losses

    diff :: Float
    diff = fromIntegral (wins - losses)
```

Now to map over all the values in our tables to get home and away ratings:

```
recordToRatingTable :: Map.Map String Record -> Map.Map String Rating
recordToRatingTable = Map.map recordToRating
```

```
homeRatings :: Map.Map String Rating
homeRatings = recordToRatingTable homeTable
```

```
awayRatings :: Map.Map String Rating
awayRatings = recordToRatingTable awayTable
```

Perfect! It's now possible to lookup Manchester United's home rating with
`Map.lookup "MUN" homeRatings` which is `Just 1274`.

## **TODO**

The first feature that our model will be predicting will be whether the match
was a draw or not. The probability of a draw will depend upon the rating
difference of the two teams.

If the match isn't a draw, then we will calculate if the match is a win for the
home team or not. This is conditional probability: given not a draw, what is the
probability of a win?

In order to fit our model to draw probability against rating difference, we must
first classify each match into a win or a draw. We already have the `isDraw`
function, so we just need to write a function which converts a match into a
record which contains, the rating difference and the feature (whether the match
was a draw or not).

```
matchesToDrawFeature :: [Match] -> [(Int, Bool)]
matchesToDrawFeature = map f where
```

**TODO**

**CODE**

## Match Preparation

Ultimately, we want to train our statistical model on rating difference with
some random variable and try to map it to a logistic curve like the Elo expected
result formula, but one that gives us the correct expected chance of winning for
football matches.

For each match, we'll pair up the rating difference with whether the match was
won or not (`1` for a win, `0` for anything else).

First we'll need a better way of finding a home team or away team from a match:

```
getHomeTeam :: Match -> String
getHomeTeam (homeTeam, _, _, _, True)  = homeTeam
getHomeTeam (_, homeTeam, _, _, False) = homeTeam

getAwayTeam :: Match -> String
getAwayTeam (_, awayTeam, _, _, True)  = awayTeam
getAwayTeam (awayTeam, _, _, _, False) = awayTeam
```

And a way of calculating the rating difference of a match:

```
matchRatingDiff ::
    Map.Map String Rating -> Map.Map String Rating -> Match -> Rating
matchRatingDiff homeRatings awayRatings match = ratingDiff match where

    ratingDiff :: Match -> Rating
    ratingDiff (_, _, _, _, True)  = homeRating - awayRating
    ratingDiff (_, _, _, _, False) = awayRating - homeRating

    lookup :: String -> Map.Map String Rating -> Rating
    lookup team = Data.Maybe.fromMaybe 1000 . Map.lookup team

    homeRating :: Rating
    homeRating = lookup (getHomeTeam match) homeRatings

    awayRating :: Rating
    awayRating = lookup (getAwayTeam match) awayRatings
```

```
matchRatingDiffWithWin ::
    Map.Map String Rating -> Map.Map String Rating -> Match -> (Rating, Int)
matchRatingDiffWithWin homeRatings awayRatings match = (ratingDiff, win) where

    ratingDiff :: Rating
    ratingDiff = matchRatingDiff homeRatings awayRatings match

    win :: Int
    win = if isWin match then 1 else 0
```

It's possible to map this across all the matches to get what we want:

```
allMatches :: [Match]
allMatches = concatMap homeAndAway matches
```

```
allMatchesDiffWithWin :: [(Rating, Int)]
allMatchesDiffWithWin = map ratingDiffWithWin allMatches where

    ratingDiffWithWin :: Match -> (Rating, Int)
    ratingDiffWithWin = matchRatingDiffWithWin homeRatings awayRatings
```

## Writing To A CSV File

All that needs to be done now is to take each matches' rating difference and win
variable and convert it to a string that can be written as a CSV file. This is
dead easy:

```
toCSV :: [(Rating, Int)] -> String
toCSV = foldl (++) "Rating,Win\n"
    . map (\(rating, win) -> show rating ++ "," ++ show win ++ "\n")
```

To write to a file in Haskell you just have to call `writeFile`:

```
> writeFile "matches.csv" (toCSV allMatchesDiffWithWin)
```
