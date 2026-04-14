---
title: Growth engineering one pager
publishDate: 2026-04-17
draft: true
---

This one pager introduces the growth engineering process that runs as a
continuous cycle. This was a one pager that I wrote as Footium switched from a
product focus to a growth hacking focus, after reading *Hacking Growth* by Sean
Ellis. All citations reference pages in *Hacking Growth*. I've generalised this
one pager, as to make it shareable with your team if you are thinking about
switching to growth hacking. Feel free to copy, tweak, and share.

---

## Problem

Many organisations operate in product mode, optimising for execution and
delivery instead of learning. Delivery cadence often has a slow feedback loop,
and engineering and marketing work in silos *[p. 34]*. Teams may not run typical
Agile, and their sprints may become task batches inside a larger delivery cycle,
which means they ship without fast validation. They may now have meetings that
involve the whole team, but still not operate as a truly cross-functional team.
Individual experiments can be encouraging, but the real challenge is scaling
that experimentation process across the company and making it a consistent
cross-functional habit.

## Solution

The shift is from input-driven delivery to outcome-driven growth. A growth
engineering operating model uses a single, weekly growth cycle that prioritises
experiments against clear metrics such as activation, retention, and revenue,
and then scales what works.

- **Growth meeting**: A weekly growth meeting happens on a fixed day each week.
  The main focus of the team switches from sprints to weekly growth cycles.
- **Product delivery moves to longer planning cycles**: Typical sprint rituals
  align to the broader product delivery cycle, creating 4+ week long cycles.
- **Standup**: Standup remains the same format, but is unblocker focused.
- **Focus on outcomes**: All work ties to target metrics; decisions are made on
  expected impact and measured results.
- **Deploy to prod**: To facilitate weekly experiment turnaround, deploy small
  changes via production. Keep larger product delivery cycles deploying
  upstream.

## Experiment Cycle

All experiments move through the following process:

`Analyse -> Ideate -> Prioritise -> Test`

The experiment starts with a written idea that lives in the idea backlog. Ideas
are prioritised using the ICE framework. Ideas are written and prioritised
async. Ideas are tested and analysed in a growth cycle.

## The Idea *[p. 120]*

Ideas are logged in the idea backlog and have the following form:

- Name
- Description (like an executive summary, who, what, when, where, why, how)
- Hypothesis (no broad strokes)
- Metrics to be measured (most should measure more than one)

## Prioritise *[p. 124]*

Prioritise the idea backlog asynchronously using the ICE framework:

- Impact (out of 10)
- Confidence (out of 10)
- Ease (out of 10)
- Average (out of 10)

## Roles

A growth team consists of the following roles. Everyone contributes to the idea
backlog.

- Growth lead *[p. 38]*
  - Part manager, part product owner, part scientist
  - Chooses the core focus area and objectives for the team to work on
  - Ensures the metrics are appropriate for the growth goals established
- Product manager *[p. 39]*
  - The CEO of the product
  - Oversees how features and designs are brought to life
  - Responsible for breaking down silos between engineers and marketing
- Engineers *[p. 40]*
  - Writes the code for product features that the team experiments on
  - Should be involved in the ideation process, not just task delivery
- Marketing *[p. 40]*
  - Required in a growth team for optimal results
  - Cross-pollinates their experience with engineering
- Data analyst *[p. 41]*
  - Ensures that experiments are well statistically designed and rigorous
  - Ensures user data and analytics are accessible through the analytics
    database
  - Mines for deep insight in the data

## Growth meeting *[p. 134]*

The growth meeting is a weekly meeting that happens at a fixed time each week.
It is run by the growth lead and kept on time to schedule. Everything covered
in the growth meeting is planned and decided ahead of time. What is decided in
the growth meeting is which experiments are going to be run this cycle, based
on prior prioritisation, and who is going to own each one.

- 15 mins: metrics review and update focus area
- 10 mins: review last week's testing activity
- 15 mins: key lessons learned from analysed experiments
- 15 mins: select growth tests for current cycle and assign owners
- 5 mins: check growth of idea pipeline

## The Transition Week

The first growth meeting should be used to loop everyone into the process and
explain how it is going to work *[p. 114]*. The following week, team members take
time to percolate ideas for what experiments to run in their first growth
cycle, adding ideas to the idea backlog *[p. 116]*.

Before starting the first experiment, it is a requirement to have the "Aha"
moment defined, data tracking in place, the fundamental growth equation
defined, and the goal defined.

The "Aha" moment *[p. 63, 84]* is the moment at which the user truly experiences
the core value of the product, the instant at which the product clicks for
them. For Dropbox, for example, it was when files had been synced across
devices and the user realised they could access them from anywhere.

The fundamental growth equation *[p. 91, 116]* is the simplest way to express
what drives a company's growth. It describes the company's core metrics and how
they interact with each other to drive growth. For example:

```
amount of growth = number of installs
                 * number of monthly active users
                 * number of purchasers
                 * average order size
                 * repeat purchase rate
```

The goal should be a single clear target, adapted to the organisation. For
example: 3000 paid monthly active users by the end of the year.
