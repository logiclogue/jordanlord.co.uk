---
title: 6502 Part 2 - EVM Driver
publishDate: 2024-08-17
draft: true
---

# Introduction

Right then, we're going into the land of Web3. What does that mean? It means
memory mapping a Web3 interface onto an 8-bit machine of course! This article
will be more a fantasy spec for a memory mapped Ethereum interface into an 8-bit
machine. That 8-bit machine is running 6502 with our ZX Spectrum display that we
developed in a previous article.

# Motivation

I want my 8-bit games to interact with the blockchain alright! Honestly, I have
no idea how that's going to work. To make this all viable you'd need some way to
prove the state of the 6502 machine, in order to validate that you're at the
correct part of the game to send a transaction, otherwise the game is just a
weird UI. That may be coming soon thanks to the advancements made in the ZK
world. Optimistic roll-ups would be an interesting solution that could be viable
in the year 2024. Imagine that? A 6502 optimistic roll-up?!

Anyway, let's get to it. To the spec...

# Spec

For the sake of this example, we're going to bootstrap `window.ethereum` and the
Ethereum JSON-RPC [https://ethereum.org/en/developers/docs/apis/json-rpc/].
Let's define two registers, the Web3 Status Register (W3SR) and the Web3 Request
Register (W3RR).

Memory map:

| Register | Address |
|----------|---------|
| W3SR     | 0x6000  |
| W3RR     | 0x6001  |
| W3MR     | 0x6002 - 0x6003  |

The W3SR is a read-only register which is in charge of reflecting the state of
the current Web3 connection.

| Bit | Job
|-----|---------
| 8   | Unused
| 7   | Has processed full message failed?
| 6   | Has processed full message successfully?
| 5   | Is processing message?
| 4   | Unused
| 3   | Is the wallet connected?
| 2   | Is a request in progress to connect wallet?
| 1   | Does a wallet exist?

<pre class="mermaid">
---
title: Wallet connection status state transition
---
stateDiagram-v2
    s0: Initial - 0x00
    s1: Wallet exists - 0x01
    s3: Connecting - 0x03
    s5: Connected - 0x05

    s0 --> s1: window.ethereum exists
    s1 --> s3: Request to connect
    s3 --> s1: Fails to connect
    s3 --> s5: Connection successful
    s5 --> s1: Wallet discconects
</pre>

The W3RR is a write-only register which is in charge of making requests to the
Web3 provider.

| Bit | Job
|-----|---------
| 8   | Unused
| 7   | Unused
| 6   | Cancel processing of message
| 5   | Send message
| 4   | Unused
| 3   | Unused
| 2   | Request to connect wallet
| 1   | Unused

<pre class="mermaid">
---
title: Wallet connection request state transition
---
stateDiagram-v2
    s0: Initial - 0x0
    s2: Request to connect - 0x2

    s0 --> s2
    s2 --> s0
</pre>

The W3MR is the register that we use to send messages to the JSON-RPC provider.
The register is two bytes long, and stores the address of the message in memory.
The message is stored in message pack form with a few custom extensions.

<pre class="mermaid">
---
title: Web3 message state transition
---
stateDiagram-v2
    s01: Initial - 0x01
    s11: Processing message - 0x11
    s21: Message successful - 0x21
    s41: Message failed - 0x41

    s01 --> s11: Send message W3RR 0x10
    s11 --> s21: Message sent
    s21 --> s01
    s11 --> s01: Cancel processing W3RR 0x20
    s11 --> s41: Message failed
    s41 --> s01: Message failed
</pre>

The Ethereum address that is connected is 20 bytes long and is stored from
address 0x6002 to 0x6015 in little-endian format.

The chain ID is 4 bytes long and is stored from address 0x6016 to 0x6019 in
little-endian format.

- TODO - requested chain ID

- TODO - how to transfer an RPC message?
    - use of a special msgpack extension
    - a new register flag for reading input
    - a new register flag for sending input
- TODO - receive a response?
- TODO - subscribing to events?
- TODO - current block number?

- TODO - have you specified this is for the Ethereum eco-system?

[zx_screen id=1]

[sixfiveohtwo src="code.asm" id=1]
