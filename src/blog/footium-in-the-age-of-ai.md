---
title: AI-generated games need persistent canon
publishDate: 2026-05-17
draft: true
---

Games are systems of consequence. In Tetris, every block that is misplaced
shapes how the game plays out. In Eve Online, a betrayal can shape an economy or
years of player history. Generative AI makes content cheap, however, content
alone isn't consequence. If I sell my club captain and argue with the board,
supporters should still be talking about it next season. Morale has to drop. The
board should trust me less. AI-generated games need persistent canon: an
authoritative record of the world, it is by definition consistent. It dictates
what exists, what has happened and what can happen.

*The dream.*

Consequence is important because games let people live out dreams. Minecraft
lets you craft your own world and Football Manager lets you manage your
favourite club.

As AI makes content cheap, the surface area of dreams that gaming enables will
expand. Imagine DeepMind's Genie in the future, we will be able to experience
fully immersive spatial worlds and interact with NPCs almost as if they were
real people.

Frontier labs are measuring their world model consistency in the order of
minutes. Games need worlds that are consistent between sessions, seasons, years.

*The failure.*

With Footium we have built a few generative AI features. An assistant manager
who helps you get up to speed with the game. Match reports. Player interviews.
Promotional preview images for your upcoming match. Without carefully hand
tested guardrails, generated content drifts
LLMs are inherently stochastic, and thus over time generated content drifts,
errors compound, leading to hallucinations and world state contradictions.

*The constraint.*

If we don't decide on a constraint, the search space is too large. Canon is the
state first record of the world. The guiding constraint is that everything must
be generated from canon. Thus every user interaction or generated content must
update canon. Otherwise there is no consistency. That means everything that is
generated must also update canon.

*The architecture.*

To build consistent persistent digital worlds, I'm building Canonic following
the core constraint. Canonic is AI tooling and infrastructure which acts as the
authoritative record of the world. It simultaneously acts as a harness around AI
models, while being the infrastructure on which these worlds live.

*The test.*

- Footium is a good test
- We tried putting generative AI into our world and the hard part wasn't
    generation it was consistency and persistence
- TODO - maybe this goes further up?
**TODO - cite how many user actions happen per day in the game**

I've been building Footium as the wedge. Where World of Warcraft is the digital
world of fictional fantasy and Eve Online is the digital world of space opera,
Footium is the digital world of football. Why? Because football is the world's
greatest story engine. Fans live and die by their football clubs. Stories and
traditions passed through generations. Footium has been live since late 2024,
with ~1000 daily active players, 2000 monthly active players, and $4m+ of
transfer volume.

*The bigger claim.*
