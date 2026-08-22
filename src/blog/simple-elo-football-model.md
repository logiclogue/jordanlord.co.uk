---
title: How often should a zombie team win?
publishDate: 2026-08-22
---

## Motivation

I work on a football management game. One challenging problem has been the curse
of "zombie" teams. A zombie team is a club that is unmanaged where the squad has
deteriorated to only reserve players. It's basically the poorest quality team in
the game.

The curse is that they still get results against strong teams. They score on
average 0.4 goals per game and manage to get at least a draw in approximately 4%
of matches. Before diving into changing the match engine, I needed a model that
I could tune the match engine to, otherwise I'd just be moving multipliers until
the results align. Changing modifiers based on feel has been our current
approach so far.

One of the goals of this article is to provide a practical benchmark for further
analysis and development of a football match simulation engine.

## Why Elo?

Why Elo? Elo is able to calculate an expected result given the difference in
team strengths. It gives a model that extrapolates intuitively from real teams
that are equally matched to extreme mismatches that aren't usually seen in real
world football. Those extreme mismatches are where real-world data is
sparse. Also Elo has already been applied to football by [Hvattum and
  Arntzen](https://doi.org/10.1016/j.ijforecast.2009.10.002) and also used by
  systems such as [ClubElo](http://clubelo.com).

## The current zombie landscape

Production data showed that the favourite team, with a lineup-rating advantage of
20 or more, won 97.6%, drew 1.3% and lost 1.1% of the time. However, the
controlled zombie test was worse at roughly a 4% result rate.

Looking at the tables later in this article, those result rates fit at around
mismatches of +751 and +660 Elo respectively (using a 400-point
benchmark). Intuitively this doesn't feel right. A real zombie would be
equivalent to a non-professional team. As a comparison using data from
[ClubElo.com](https://clubelo.com), we're actually seeing a result rate that
would be closer to Arsenal or Manchester City being in League Two (as of August
2026), rather than in a non-professional league. That rate comes at +650 on
average for an elite Premier League team vs a League Two team. Hence you could
imagine the Premier League champions dropping a couple of points over the course
of a 46 game League Two season. This would loosely align with the favourite's
observed result rate of 97.6%. However, if we want the true zombie
non-professional effect, then a zombie result should be extremely rare.

We can turn to chess to build an intuitive loose mental model for the zombie. A
casual online chess player might have a rating of 1,000 while a grandmaster has
a rating of 2,500. That's a +1,500 gap. Note this is only an initial observation
based on intuition, not the actual method of calibration.

## Adding draws with the Rao-Kupper model

Standard Elo formulas give an expected score given the rating difference
between two competitors. In a binary game, the score can be treated as a win
probability. However, that doesn't directly translate into football. Football is
a ternary game, so we need to model draws if we want to build a model. To
achieve this, I attempted both the Rao-Kupper and Davidson models. Although both
fitted the data well, I found that the Rao-Kupper ordered-logistic model had a
more intuitive extreme mismatch tail. So that's the one that's used moving
forwards, as the extreme mismatch tail is where the zombies live.

For fitting, I took 46,652 matches for training and 10,916 as a chronological
holdout from the public [Club Football Match Data
repository](https://github.com/xgabora/Club-Football-Match-Data-2000-2025). The
fitted model's chronological holdout log loss was 1.001, beating the frequency
baseline on unseen matches at 1.075. The frequency baseline basically used the
training set's overall home-win, draw, and away-win frequencies.

With the Elo scale fixed at 400, I used maximum likelihood to fit home advantage
and the neutral draw margin. I found that the fitted equal-team draw probability
was 30%.

In the dataset, there is a home advantage so we have to factor that in. Home
advantage was fitted at approximately 59.8 Elo points. Although 430 was the Elo
scale that fitted the given dataset, I chose to fix the Elo scale at 400 as that
is more conventional, and refitted the other parameters. The `neutralDrawMargin`
is the range around a neutral performance which becomes a draw at approximately
30%.

```
eloScale = 400
homeAdvantage = 59.8
neutralDrawMargin = 0.6195

P(draw | equal teams, neutral ground)
    = 1 - 2 * sigmoid(-neutralDrawMargin)
    = 30.0%
```

Using those formulas, we can calculate the probability of a home win, away win
or a draw. `d` is the home team's Elo minus the away team's Elo.

```
effectiveDifference = d + homeAdvantage
z = ln(10) * effectiveDifference / eloScale

P(home win) = sigmoid(z - neutralDrawMargin)
P(away win) = sigmoid(-z - neutralDrawMargin)
P(draw)     = 1 - P(home win) - P(away win)

P(underdog result) = P(draw) + P(underdog win)
```

For a neutral match, we set `homeAdvantage` to zero. If the stronger team is
away, we apply the home advantage to the opposition first.

```
P(home win) + P(draw) + P(away win) = 1
```

## Result probabilities

Plugging all of our parameters together, and precalculating for a pre-set of Elo
rating differences, we get the following table for a neutral venue match.

|      d | P(favourite win) | P(draw) | P(underdog win) | P(underdog result) |
|-------:|-----------------:|--------:|----------------:|-------------------:|
|     +0 |          34.990% | 30.021% |         34.990% |            65.010% |
|   +100 |          48.904% | 27.862% |         23.234% |            51.096% |
|   +200 |          62.990% | 22.465% |         14.544% |            37.010% |
|   +300 |          75.165% | 16.100% |          8.735% |            24.835% |
|   +400 |          84.331% | 10.561% |          5.107% |            15.669% |
|   +500 |          90.540% |  6.522% |          2.938% |             9.460% |
|   +600 |          94.451% |  3.876% |          1.673% |             5.549% |
|   +700 |          96.802% |  2.250% |          0.948% |             3.198% |
|   +800 |          98.176% |  1.289% |          0.535% |             1.824% |
|   +900 |          98.966% |  0.732% |          0.302% |             1.034% |
| +1,000 |          99.416% |  0.414% |          0.170% |             0.584% |
| +1,250 |          99.861% |  0.099% |          0.040% |             0.139% |
| +1,500 |          99.967% |  0.023% |          0.010% |             0.033% |
| +1,750 |          99.992% |  0.006% |          0.002% |             0.008% |
| +2,000 |          99.998% |  0.001% |          0.001% |             0.002% |

Looking at 57,568 domestic league matches from July 2015 to June 2025 from
the public [Club Football Match Data
repository](https://github.com/xgabora/Club-Football-Match-Data-2000-2025), our
calculations using the Rao-Kupper model approximately line up. At the extremes
it's harder to align the dataset because outlier results have a bigger impact
with less data available, e.g. the 500-600 row contains 18 matches which
includes one underdog win. So we must use our intuition.

| Elo difference | Matches | Favourite win |  Draw | Underdog win | Underdog result |
|---------------:|--------:|--------------:|------:|-------------:|----------------:|
|           0-25 |  10,153 |         36.4% | 29.6% |        34.0% |           63.6% |
|          25-50 |   9,184 |         39.6% | 29.1% |        31.3% |           60.4% |
|         50-100 |  14,841 |         43.8% | 29.1% |        27.1% |           56.2% |
|        100-150 |   9,514 |         50.4% | 25.7% |        24.0% |           49.6% |
|        150-200 |   5,377 |         58.3% | 22.6% |        19.1% |           41.7% |
|        200-250 |   3,381 |         64.8% | 20.8% |        14.5% |           35.2% |
|        250-300 |   2,116 |         70.6% | 17.2% |        12.1% |           29.3% |
|        300-400 |   2,406 |         77.5% | 15.0% |         7.5% |           22.5% |
|        400-500 |     578 |         84.3% |  9.5% |         6.2% |           15.7% |
|        500-600 |      18 |         94.4% |  0.0% |         5.6% |            5.6% |

For the fitted predictions below, we use each match's exact Elo gap after
applying the fitted home advantage. This is a calibration check, although
performance of the model remained similar on the chronological holdout.

| Elo difference | Fitted favourite win | Fitted draw | Fitted underdog win | Fitted underdog result |
|---------------:|---------------------:|------------:|--------------------:|-----------------------:|
|           0-25 |               36.82% |      29.19% |              33.99% |                 63.18% |
|          25-50 |               40.38% |      28.92% |              30.70% |                 59.62% |
|         50-100 |               45.23% |      28.12% |              26.66% |                 54.77% |
|        100-150 |               52.04% |      26.34% |              21.62% |                 47.96% |
|        150-200 |               59.08% |      23.79% |              17.13% |                 40.92% |
|        200-250 |               65.48% |      20.97% |              13.55% |                 34.52% |
|        250-300 |               71.86% |      17.75% |              10.39% |                 28.14% |
|        300-400 |               78.78% |      13.85% |               7.37% |                 21.22% |
|        400-500 |               85.89% |       9.52% |               4.60% |                 14.11% |
|        500-600 |               91.45% |       5.90% |               2.65% |                  8.55% |

## Next steps

So how often should a zombie team win? The 1,500 rating gap gives a zombie a
0.010% chance of winning, which is roughly once in every 10,000 matches. That
can act as a good stress-test target moving forward. However, it's not
calibrated, for that we need more context from the game and its engine.

Although Elo gives us a mathematical bridge to real-world football, to really
understand the zombie, we have to now bridge Elo to the game's engine. The next
step is to map the 0-100 player ratings including tactics onto Elo, then test
whether the engine follows the curve all the way to the extreme mismatches. Once
the next bridge is built, there will be an intuitive statistical link between
real-world football and the game's engine. Thus that will help build a better
intuition to make solid decisions and evaluate the engine's output and finally
kill zombies for good.

## References

- P. V. Rao and L. L. Kupper, ["Ties in Paired-Comparison Experiments:
     A Generalization of the Bradley-Terry
     Model"](https://doi.org/10.1080/01621459.1967.10482901), 1967.
- L. Szczecinski and A. Djebbi, ["Understanding Draws in Elo Rating
  Algorithm"](https://doi.org/10.1515/jqas-2019-0052), 2020.
- R. R. Davidson, ["On Extending the Bradley-Terry Model to Accommodate Ties in
  Paired Comparison
  Experiments"](https://doi.org/10.1080/01621459.1970.10481082), 1970.
- L. M. Hvattum and H. Arntzen, ["Using ELO ratings for match result prediction
  in association football"](https://doi.org/10.1016/j.ijforecast.2009.10.002),
  2010.
- [ClubElo](http://clubelo.com).
- [Club Football Match Data
  2000-2025](https://github.com/xgabora/Club-Football-Match-Data-2000-2025).
