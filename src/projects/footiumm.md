---
web: https://footiumm.vercel.app
platform: Eth
github: logiclogue/footiumm
publishDate: 2024-03-10
title: FootiuMM
---

FootiuMM is a novel NFT automated market maker for Footium Football Player NFTs.
Footium co-founder, James O'Leary, and I built FootiuMM as part of the Eth
Oxford hackathon in 48 hours. We came first in the hackathon's DeFi track.

The AMM (automated market maker) is inspired by the Uniswap protocol. There is a
function where the price of an NFT is determined by the ratio of NFTs to Eth
respectively. This means that when an NFT is bought, you'd expect some slippage,
the price of the NFTs will increase. When an NFT is sold, the price of the NFTs
will decrease.

There is no special price mechanism for NFTs of different attributes, therefore
you'd expect NFTs in this AMM to be the floor.

As an extension to the project, we added a pool token. The goal of the pool
token was to incentive liquidity into the AMM's pool. In return, the pool of Eth
to pool token increases by a percentage on every NFT trade.

These contracts were deployed on Arbitrum Sepolia test-net and were compatible
with the Footium Play-test Brazil player NFTs. Disclaimer - these contracts were
used for demonstration purposes only, they have not be audited and should not be
used in a production context.
