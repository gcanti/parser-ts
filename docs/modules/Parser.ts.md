---
title: Parser.ts
nav_order: 4
parent: Modules
---

# Parser overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [Parser (interface)](#parser-interface)
- [URI (type alias)](#uri-type-alias)
- [URI](#uri)
- [alt](#alt)
- [ap](#ap)
- [apFirst](#apfirst)
- [apSecond](#apsecond)
- [chain](#chain)
- [chainFirst](#chainfirst)
- [cut](#cut)
- [cutWith](#cutwith)
- [either](#either)
- [eof](#eof)
- [expected](#expected)
- [fail](#fail)
- [failAt](#failat)
- [flatten](#flatten)
- [getMonoid](#getmonoid)
- [item](#item)
- [many](#many)
- [many1](#many1)
- [map](#map)
- [maybe](#maybe)
- [parser](#parser)
- [sat](#sat)
- [sepBy](#sepby)
- [sepBy1](#sepby1)
- [sepByCut](#sepbycut)
- [seq](#seq)
- [succeed](#succeed)
- [withStart](#withstart)

---

# Parser (interface)

**Signature**

```ts
export interface Parser<I, A> {
  (i: Stream<I>): ParseResult<I, A>
}
```

Added in v0.6.0

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.6.0

# URI

**Signature**

```ts
export const URI: "Parser" = ...
```

Added in v0.6.0

# alt

**Signature**

```ts
<E, A>(that: () => Parser<E, A>) => (fa: Parser<E, A>) => Parser<E, A>
```

Added in v0.6.0

# ap

**Signature**

```ts
<E, A>(fa: Parser<E, A>) => <B>(fab: Parser<E, (a: A) => B>) => Parser<E, B>
```

Added in v0.6.0

# apFirst

**Signature**

```ts
<E, B>(fb: Parser<E, B>) => <A>(fa: Parser<E, A>) => Parser<E, A>
```

Added in v0.6.0

# apSecond

**Signature**

```ts
<e, B>(fb: Parser<e, B>) => <A>(fa: Parser<e, A>) => Parser<e, B>
```

Added in v0.6.0

# chain

**Signature**

```ts
<E, A, B>(f: (a: A) => Parser<E, B>) => (ma: Parser<E, A>) => Parser<E, B>
```

Added in v0.6.0

# chainFirst

**Signature**

```ts
<E, A, B>(f: (a: A) => Parser<E, B>) => (ma: Parser<E, A>) => Parser<E, A>
```

Added in v0.6.0

# cut

The `cut` parser combinator takes a parser and produces a new parser for
which all errors are fatal, causing either to stop trying further
parsers and return immediately with a fatal error.

**Signature**

```ts
export function cut<I, A>(p: Parser<I, A>): Parser<I, A> { ... }
```

Added in v0.6.0

# cutWith

Takes two parsers `p1` and `p2`, returning a parser which will match
`p1` first, discard the result, then either match `p2` or produce a fatal
error.

**Signature**

```ts
export function cutWith<I, A, B>(p1: Parser<I, A>, p2: Parser<I, B>): Parser<I, B> { ... }
```

Added in v0.6.0

# either

The `either` combinator takes two parsers, runs the first on the input
stream, and if that fails, it will backtrack and attempt the second
parser on the same input. Basically, try parser 1, then try parser 2.

If the first parser fails with an error flagged as fatal (see `cut`),
the second parser will not be attempted.

This is equivalent to the `alt` operation.

**Signature**

```ts
export function either<I, A>(p: Parser<I, A>, f: () => Parser<I, A>): Parser<I, A> { ... }
```

Added in v0.6.0

# eof

Matches the end of the stream.

**Signature**

```ts
export function eof<I>(): Parser<I, void> { ... }
```

Added in v0.6.0

# expected

A parser combinator which returns the provided parser unchanged, except
that if it fails, the provided error message will be returned in the
ParseError`.

**Signature**

```ts
export function expected<I, A>(p: Parser<I, A>, message: string): Parser<I, A> { ... }
```

Added in v0.6.0

# fail

The `fail` parser will just fail immediately without consuming any input

**Signature**

```ts
export function fail<I, A = never>(): Parser<I, A> { ... }
```

Added in v0.6.0

# failAt

The `failAt` parser will fail immediately without consuming any input,
but will report the failure at the provided input position.

**Signature**

```ts
export function failAt<I, A = never>(i: Stream<I>): Parser<I, A> { ... }
```

Added in v0.6.0

# flatten

**Signature**

```ts
<E, A>(mma: Parser<E, Parser<E, A>>) => Parser<E, A>
```

Added in v0.6.0

# getMonoid

**Signature**

```ts
export function getMonoid<I, A>(M: Monoid<A>): Monoid<Parser<I, A>> { ... }
```

Added in v0.6.0

# item

The `item` parser consumes a single value, regardless of what it is,
and returns it as its result.

**Signature**

```ts
export function item<I>(): Parser<I, I> { ... }
```

Added in v0.6.0

# many

The `many` combinator takes a parser, and returns a new parser which will
run the parser repeatedly on the input stream until it fails, returning
a list of the result values of each parse operation as its result, or the
empty list if the parser never succeeded.

Read that as "match this parser zero or more times and give me a list of
the results."

**Signature**

```ts
export function many<I, A>(p: Parser<I, A>): Parser<I, Array<A>> { ... }
```

Added in v0.6.0

# many1

The `many1` combinator is just like the `many` combinator, except it
requires its wrapped parser to match at least once. The resulting list is
thus guaranteed to contain at least one value.

**Signature**

```ts
export function many1<I, A>(p: Parser<I, A>): Parser<I, NonEmptyArray<A>> { ... }
```

Added in v0.6.0

# map

**Signature**

```ts
<A, B>(f: (a: A) => B) => <E>(fa: Parser<E, A>) => Parser<E, B>
```

Added in v0.6.0

# maybe

The `maybe` parser combinator creates a parser which will run the provided
parser on the input, and if it fails, it will returns the empty value (as
defined by `empty`) as a result, without consuming any input.

**Signature**

```ts
export function maybe<A>(M: Monoid<A>): <I>(p: Parser<I, A>) => Parser<I, A> { ... }
```

Added in v0.6.0

# parser

**Signature**

```ts
export const parser: Monad2<URI> & Alternative2<URI> = ...
```

Added in v0.6.0

# sat

The `sat` parser constructor takes a predicate function, and will consume
a single character if calling that predicate function with the character
as its argument returns `true`. If it returns `false`, the parser will
fail.

**Signature**

```ts
export function sat<I>(predicate: Predicate<I>): Parser<I, I> { ... }
```

Added in v0.6.0

# sepBy

Matches the provided parser `p` zero or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export function sepBy<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, Array<B>> { ... }
```

Added in v0.6.0

# sepBy1

Matches the provided parser `p` one or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export function sepBy1<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, NonEmptyArray<B>> { ... }
```

Added in v0.6.0

# sepByCut

Like `sepBy1`, but cut on the separator, so that matching a `sep` not
followed by a `p` will cause a fatal error.

**Signature**

```ts
export function sepByCut<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, NonEmptyArray<B>> { ... }
```

Added in v0.6.0

# seq

The `seq` combinator takes a parser, and a function which will receive
the result of that parser if it succeeds, and which should return another
parser, which will be run immediately after the initial parser. In this
way, you can join parsers together in a sequence, producing more complex
parsers.

This is equivalent to the monadic `chain` operation.

**Signature**

```ts
export function seq<I, A, B>(fa: Parser<I, A>, f: (a: A) => Parser<I, B>): Parser<I, B> { ... }
```

Added in v0.6.0

# succeed

The `succeed` parser constructor creates a parser which will simply
return the value provided as its argument, without consuming any input.

This is equivalent to the monadic `of`.

**Signature**

```ts
export function succeed<I, A>(a: A): Parser<I, A> { ... }
```

Added in v0.6.0

# withStart

Converts a parser into one which will return the point in the stream where
it started parsing in addition to its parsed value.

Useful if you want to keep track of where in the input stream a parsed
token came from.

**Signature**

```ts
export function withStart<I, A>(p: Parser<I, A>): Parser<I, [A, Stream<I>]> { ... }
```

Added in v0.6.0
