---
title: Football Simulation Part 2: Statistics With R
draft
---

## Logistic Regression

With this data, we're going to plot wins against rating difference.

First of all, we need a function which will be able to tell whether a match is a
win or not.

```
isMatchWin :: Match -> Bool
isMatchWin (_, _, homeGoals, awayGoals) = homeGoals > awayGoals
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
matchWinWithRating :: [Team] -> Match -> (Rating, String)
matchWinWithRating teams match = (ratingDiff, isWin) where

    ratingDiff :: Rating
    ratingDiff = matchRatingDiff teams match

    isWin :: Bool
    isWin = isMatchWin match
```

By mapping `matchWinWithRating teams` over `matches`, it's possible to get all
of the data we need.

Now we need to understand how Logistic regression works so that we can create a
logistic model for the rating against wins. Then we should be able to fit that
into Elo's model.

A logistic function is of the form:

```
f(x) = L / (1 + e^(-k(x - x0)))
```

Where `L` is the maximum value, which will be 1 in our case. `e` is Euler's
number. `k` is the 'logistic growth rate'. Finally, `x0` is the x-value of the
sigmoid midpoint.

So the only values we need to find are `k` and `x0`.

We'll find these values using gradient descent. The process will be similar to
how neural networks are trained on their training data. We'll be using all of
Premier League results as training data.

I'm not going to explain the process in massive detail as this article would be
twice the length. But [here is a great
article](http://ucanalytics.com/blogs/gradient-descent-logistic-regression-simplified-step-step-visual-guide/)
I recommend reading on the topic.

- Gradient descent

## Logistic Regression With R

```
train <- read.csv('train.csv', header=T, na.string=c(""))

model <- glm(Win ~ ., family = binomial(link = 'logit'), data = train)
```

## Elo Home Advantage

It'll be important to find the Elo home advantage, so that we can correctly
train our model on the training data. It's clear in football that the home team
has an advantage, but by how much?

In theory, the average rating difference of wins should be 0. The average rating
of teams winning when they play at home is 105. Therefore, we can increase the
home advantage by 105 for all matches.

- Training our model on Premier League results
- Using our model to predict the outcome of future matches

- Creating a model for goals scored
    - Poisson regression
