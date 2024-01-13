---
title: Dream Architecture
draft: true
---

- Least abstract to most abstract
    - Entities
    - Domain logic
    - Business logic
    - Code with side effects

- Code can only depend upon code which is more abstract
- Controllers return actions which are values
- Actions are interpreted by the reducer
- Actions are carried by reactive streams
