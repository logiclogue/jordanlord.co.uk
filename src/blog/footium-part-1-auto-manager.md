---
title: Footium Part 1 - Auto Manager
draft: true
---

# Introduction

*A small disclaimer, this is purely a Footium strategy that is used for testing
in a test environment. This is not my strategy in the live game, there are
stringent rules placed on the way that team members can play the game.*

To make a concession, I'm poor at playing Footium. I founded Footium in 2020, as
you may see from projects on this website, it's been a dream of mine to build a
football simulation game for some time. Just recently in season 1, my beloved
Hightock Albion missed out on promotion by four points. Meanwhile, my great
colleague but also fearce rival Nick, won promotion with Barch Wanderers. This
is a similar story in our test league. Nick and his hoard of clubs have managed
to win TODO% of all seasons. Pock Town, my test team, have had moderate success,
winning three trophies overall (TODO fact check).

It's time for that to change. My strategy is to utilise all of my test teams in
the Footium test league pyramid to, not only win the league, but to **dominate**
the entirety of Division One. In the space of four seasons, Pock Town and the
associated clubs will come to dominate the league. The strategy is to use bots
in order to achieve this.

# League Rules

Our test league can be quite sleepy at times, especially during live seasons. A
season plays out in one full week. We have 4 days of matches, 3 days of
in-between season downtime. Each day has 6 matches, which make it quite intense
to manage. There are at least two matches per day where it's feasibly impossible
for somebody to be live managing their club. If I can write a bot, it gives me
a significant advantage.

The matches play in the following schedule:

- 9:15
- 13:15
- 17:15
- 21:15
- 1:15
- 5:15

Each season is broken up into "Sprints" which run in parity with our development
cycle, where we have one Sprint per week. The current season that is ending is
Sprint 85. Pock Town have finished in seventh position after quite poor
management, narrowly avoiding relegation on the final day.

There are 6 divisions, each team member is given an equal share of the 756
clubs. Here are a list of my clubs and where they currently sit:

TODO

# My Strategy

The strategy is to engage every single one of those clubs with an
auto-management bot. Each bot will have a slightly different strategy, which
will be defined by the following parameters:

- Target squad size - this will determine whether they sign academy players or
    not, for the first number of seasons I'd expect all clubs to sign academy
    players to make up for the gaps
- Squad evaluation function - each match-day squad will be evaluated differently
    by each club
- Training strategy - each club will have its own training strategy, some will
    prioritise training younger players, others will prioritise training their
    best players, some randomly, others their older players and so on

Another challenge is going to be that most of the clubs don't have any players.
Because they've gone unmanaged for a number of seasons, almost every club has
all retired players.

Each match's lineup will be set 15 minutes before the start of the game. No
in-game management will happen for version 1.

# Version 1

Version 1 involves just trying to choose the best team before a match, while
also having a standard training strategy to train the youngest player will
available potential that's not in a match day squad.

For the sake of simplicity, there will be a hot wallet that will own all of the
clubs and players. The script will have access to that wallet's private key via
an environment variable. To aid the transition, we'll need to write an auto
registration script. We'll employ a simple rule, that rule will be to register
players based on their `originClubId`.

- for each club
    - if any players that are owned by the same wallet, same `originClubId` but
        don't own the player, then register that player

We'll also be automatically signing academy players if the size of the squad is
less than 30 and there are academy players available to sign. I'm assuming here
that I have enough Sepolia Eth to sign the players.

# Season One (Sprint 86)

It was a bit of a rocky start. It turns out there was an issue with the auto
manager, alongside it being release week for Footium, which meant I didn't have
much time to fix. The issue was with the player cache I was using, it was out of
date and wasn't repopulated. This meant that teams were submitted not using the
newly signed academy players.

In addition, it meant that teams from other clubs that had been transferred
weren't being used. This found a regression in our lineup validation. The
validation allowed players from other clubs to be submitted in a lineup for my
club. This meant that my tactics page wouldn't load, nor would matches start for
my clubs that had the cross pollinated players.

At the end of the day, Project Hawking lost 5-6 full matches at the start of our
first season. Pock Town sunk into the relegation zone with a few games in hand
to make up for.

- Pock Town finished 3rd
- most teams got promoted

# Season Two (Sprint 87)

Season two has started. We've now got two teams in the top division, Pock Town
and Wiversing.

It wasn't until Tuesday 17:30 that the auto-select bug was found.

Then on Wednesday 09:00 another upgrade was made where we were now properly
invalidating the player cache, so that the auto select should more accurately
select the best team. In addition, auto select should now fail a lot less. There
were instances where auto select was failing to submit lineups because player
had just been put in training. 

Once that was set, the teams performed a lot better. A number of clubs got
promoted out of their respective division. Pock Town and Wiversing remained in
Division One. Sild City and Binchellinst got promoted to Division One. Sadly in
Division Two - League One, Regingsey didn't make it. They got pipped to
promotion by Chitnorwore and Moodburn, both Division One giants.

This poor competitive performance can mostly be attributed to the low depth of
squad of these teams, combined with the inability to react to invalid lineups.

- final league standings

# Season Three (Sprint 88)

In Season Three, we started off with 4 Division One Clubs Binchellinst,
Wiversing, Pock Town, and Sild City. And 8 Division Two clubs, Baton United,
Bexham Rovers, Caistord, Crough Wanderers, Helver Rangers, Lyn an Villa, Totlest
Albion, Wattinstasins, and the poor Regingsey. No clubs remain in Division Six.

At this point we've now ran out of ETH with only 0.16 Sepolia ETH left in the
wallet. We must be more sustainable moving forwards.

- lineup evaluation
- more efficient training

# Season Four (Sprint 89)

- Pock Town Champions!
- Baton United and Regingsey relegated

# Season Five (Sprint 90)

- Pock Town second
- Binchellinst Champions!

# Season Six (Sprint 91)

- revival of Nick
- Beverle Champions
- Hawkbot stops working properly

# Season Seven (Sprint 92)

- Beverle Champions again
- Hawkbot continues to not run

# Season Eight (Sprint 93)

- TODO
    - open sources
    - revival of Hawkbot
    - cache fixes
    - formation chooser
    - squad re-balancer
    - back-to-back training
