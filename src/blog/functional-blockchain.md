---
title: The Functional Blockchain
draft: true
---

The goal is to create a Blockchain with a functional programming language.

The domain logic can be written in a purely functional way. Functional reactive
programming will be used to work with the lower level details of working with
HTTP requests or web sockets.

The best option will be to use OCaml with BuckleScript to compile to JavaScript
for NodeJS. I've got a few other projects in the work and it'll integrate nicely
by using OCaml and BuckleScript.

## Rules

It's important that we first outline the rules of our application, then we'll
encode these rules in the domain logic of our application.

This blockchain will be kept as simple as possible. Each block will contain a
header.

The header will contain the following fields: version, hash of the previous
block, hash merkle root, timestamp, nonce.

The block itself contains a header and transactions.

The block hash doesn't need to be stored with the block as it is quickly
calculated on the fly.

For now, we won't worry about the difficulty.

## Implementation

This won't be a full code listing. We won't worry about how the hash is
calculated from the block, etc.

`BlockHeader.ml`:

```
type t = {
    version          : int;
    hash_prev_block  : Hash.t;
    hash_merkle_root : Hash.t;
    timestamp        : int;
    nonce            : string;
}
```

`Block.ml`:

```
type t = {
    header : BlockHeader.t;
    data   : Transaction.t list;
}
```

`BlockChain.ml`:

```
(** To be implemented **)
```
