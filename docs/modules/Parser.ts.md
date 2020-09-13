---
title: Parser.ts
nav_order: 4
parent: Modules
---

## Parser overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [Alt](#alt)
  - [alt](#alt)
- [Alternative](#alternative)
  - [zero](#zero)
- [Applicative](#applicative)
  - [of](#of)
- [Apply](#apply)
  - [ap](#ap)
  - [apFirst](#apfirst)
  - [apSecond](#apsecond)
- [Functor](#functor)
  - [map](#map)
- [Monad](#monad)
  - [chain](#chain)
  - [chainFirst](#chainfirst)
  - [flatten](#flatten)
- [combinators](#combinators)
  - [between](#between)
  - [cut](#cut)
  - [cutWith](#cutwith)
  - [either](#either)
  - [eof](#eof)
  - [expected](#expected)
  - [item](#item)
  - [lookAhead](#lookahead)
  - [many](#many)
  - [many1](#many1)
  - [maybe](#maybe)
  - [sepBy](#sepby)
  - [sepBy1](#sepby1)
  - [sepByCut](#sepbycut)
  - [seq](#seq)
  - [surroundedBy](#surroundedby)
  - [takeUntil](#takeuntil)
  - [withStart](#withstart)
- [constructors](#constructors)
  - [fail](#fail)
  - [failAt](#failat)
  - [sat](#sat)
  - [succeed](#succeed)
- [instances](#instances)
  - [Alt](#alt-1)
  - [Alternative](#alternative-1)
  - [Applicative](#applicative-1)
  - [Functor](#functor-1)
  - [Monad](#monad-1)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [getMonoid](#getmonoid)
  - [getSemigroup](#getsemigroup)
  - [parser](#parser)
- [model](#model)
  - [Parser (interface)](#parser-interface)
- [utils](#utils)
  - [bind](#bind)
  - [bindTo](#bindto)

---

# Alt

## alt

**Signature**

```ts
export declare const alt: <I, A>(that: Lazy<Parser<I, A>>) => (fa: Parser<I, A>) => Parser<I, A>
```

Added in v0.6.7

# Alternative

## zero

**Signature**

```ts
export declare const zero: <I, A>() => Parser<I, A>
```

Added in v0.6.7

# Applicative

## of

**Signature**

```ts
export declare const of: <I, A>(a: A) => Parser<I, A>
```

Added in v0.6.7

# Apply

## ap

**Signature**

```ts
export declare const ap: <I, A>(fa: Parser<I, A>) => <B>(fab: Parser<I, (a: A) => B>) => Parser<I, B>
```

Added in v0.6.7

## apFirst

**Signature**

```ts
export declare const apFirst: <I, B>(fb: Parser<I, B>) => <A>(fa: Parser<I, A>) => Parser<I, A>
```

Added in v0.6.7

## apSecond

**Signature**

```ts
export declare const apSecond: <I, B>(fb: Parser<I, B>) => <A>(fa: Parser<I, A>) => Parser<I, B>
```

Added in v0.6.7

# Functor

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => <I>(fa: Parser<I, A>) => Parser<I, B>
```

Added in v0.6.7

# Monad

## chain

**Signature**

```ts
export declare const chain: <I, A, B>(f: (a: A) => Parser<I, B>) => (ma: Parser<I, A>) => Parser<I, B>
```

Added in v0.6.7

## chainFirst

**Signature**

```ts
export declare const chainFirst: <I, A, B>(f: (a: A) => Parser<I, B>) => (ma: Parser<I, A>) => Parser<I, A>
```

Added in v0.6.7

## flatten

**Signature**

```ts
export declare const flatten: <I, A>(mma: Parser<I, Parser<I, A>>) => Parser<I, A>
```

Added in v0.6.7

# combinators

## between

Matches the provided parser `p` that occurs between the provided `left` and `right` parsers.

`p` is polymorphic in its return type, because in general bounds and actual parser could return different types.

**Signature**

```ts
export declare const between: <I, A>(left: Parser<I, A>, right: Parser<I, A>) => <B>(p: Parser<I, B>) => Parser<I, B>
```

Added in v0.6.4

## cut

The `cut` parser combinator takes a parser and produces a new parser for
which all errors are fatal, causing either to stop trying further
parsers and return immediately with a fatal error.

**Signature**

```ts
export declare const cut: <I, A>(p: Parser<I, A>) => Parser<I, A>
```

Added in v0.6.0

## cutWith

Takes two parsers `p1` and `p2`, returning a parser which will match
`p1` first, discard the result, then either match `p2` or produce a fatal
error.

**Signature**

```ts
export declare const cutWith: <I, A, B>(p1: Parser<I, A>, p2: Parser<I, B>) => Parser<I, B>
```

Added in v0.6.0

## either

The `either` combinator takes two parsers, runs the first on the input
stream, and if that fails, it will backtrack and attempt the second
parser on the same input. Basically, try parser 1, then try parser 2.

If the first parser fails with an error flagged as fatal (see `cut`),
the second parser will not be attempted.

This is equivalent to the `alt` operation.

**Signature**

```ts
export declare const either: <I, A>(p: Parser<I, A>, f: () => Parser<I, A>) => Parser<I, A>
```

Added in v0.6.0

## eof

Matches the end of the stream.

**Signature**

```ts
export declare const eof: <I>() => Parser<I, void>
```

Added in v0.6.0

## expected

A parser combinator which returns the provided parser unchanged, except
that if it fails, the provided error message will be returned in the
ParseError`.

**Signature**

```ts
export declare const expected: <I, A>(p: Parser<I, A>, message: string) => Parser<I, A>
```

Added in v0.6.0

## item

The `item` parser consumes a single value, regardless of what it is,
and returns it as its result.

**Signature**

```ts
export declare const item: <I>() => Parser<I, I>
```

Added in v0.6.0

## lookAhead

Takes a `Parser` and tries to match it without consuming any input.

**Signature**

```ts
export declare const lookAhead: <I, A>(p: Parser<I, A>) => Parser<I, A>
```

**Example**

```ts
import { run } from 'parser-ts/code-frame'
import * as P from 'parser-ts/Parser'
import * as S from 'parser-ts/string'

const parser = S.fold([S.string('hello '), P.lookAhead(S.string('world')), S.string('wor')])

run(parser, 'hello world')
// { _tag: 'Right', right: 'hello worldwor' }
```

Added in v0.6.6

## many

The `many` combinator takes a parser, and returns a new parser which will
run the parser repeatedly on the input stream until it fails, returning
a list of the result values of each parse operation as its result, or the
empty list if the parser never succeeded.

Read that as "match this parser zero or more times and give me a list of
the results."

**Signature**

```ts
export declare const many: <I, A>(p: Parser<I, A>) => Parser<I, A[]>
```

Added in v0.6.0

## many1

The `many1` combinator is just like the `many` combinator, except it
requires its wrapped parser to match at least once. The resulting list is
thus guaranteed to contain at least one value.

**Signature**

```ts
export declare const many1: <I, A>(p: Parser<I, A>) => Parser<I, NEA.NonEmptyArray<A>>
```

Added in v0.6.0

## maybe

The `maybe` parser combinator creates a parser which will run the provided
parser on the input, and if it fails, it will returns the empty value (as
defined by `empty`) as a result, without consuming any input.

**Signature**

```ts
export declare const maybe: <A>(M: Monoid<A>) => <I>(p: Parser<I, A>) => Parser<I, A>
```

Added in v0.6.0

## sepBy

Matches the provided parser `p` zero or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export declare const sepBy: <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>) => Parser<I, B[]>
```

Added in v0.6.0

## sepBy1

Matches the provided parser `p` one or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export declare const sepBy1: <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>) => Parser<I, NEA.NonEmptyArray<B>>
```

Added in v0.6.0

## sepByCut

Like `sepBy1`, but cut on the separator, so that matching a `sep` not
followed by a `p` will cause a fatal error.

**Signature**

```ts
export declare const sepByCut: <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>) => Parser<I, NEA.NonEmptyArray<B>>
```

Added in v0.6.0

## seq

The `seq` combinator takes a parser, and a function which will receive
the result of that parser if it succeeds, and which should return another
parser, which will be run immediately after the initial parser. In this
way, you can join parsers together in a sequence, producing more complex
parsers.

This is equivalent to the monadic `chain` operation.

**Signature**

```ts
export declare const seq: <I, A, B>(fa: Parser<I, A>, f: (a: A) => Parser<I, B>) => Parser<I, B>
```

Added in v0.6.0

## surroundedBy

Matches the provided parser `p` that is surrounded by the `bound` parser. Shortcut for `between(bound, bound)`.

**Signature**

```ts
export declare const surroundedBy: <I, A>(bound: Parser<I, A>) => <B>(p: Parser<I, B>) => Parser<I, B>
```

Added in v0.6.4

## takeUntil

Takes a `Predicate` and continues parsing until the given `Predicate` is satisfied.

**Signature**

```ts
export declare const takeUntil: <I>(predicate: Predicate<I>) => Parser<I, I[]>
```

**Example**

```ts
import * as C from 'parser-ts/char'
import { run } from 'parser-ts/code-frame'
import * as P from 'parser-ts/Parser'

const parser = P.takeUntil((c: C.Char) => c === 'w')

run(parser, 'hello world')
// { _tag: 'Right', right: [ 'h', 'e', 'l', 'l', 'o', ' ' ] }
```

Added in v0.6.6

## withStart

Converts a parser into one which will return the point in the stream where
it started parsing in addition to its parsed value.

Useful if you want to keep track of where in the input stream a parsed
token came from.

**Signature**

```ts
export declare const withStart: <I, A>(p: Parser<I, A>) => Parser<I, [A, Stream<I>]>
```

Added in v0.6.0

# constructors

## fail

The `fail` parser will just fail immediately without consuming any input

**Signature**

```ts
export declare const fail: <I, A = never>() => Parser<I, A>
```

Added in v0.6.0

## failAt

The `failAt` parser will fail immediately without consuming any input,
but will report the failure at the provided input position.

**Signature**

```ts
export declare const failAt: <I, A = never>(i: Stream<I>) => Parser<I, A>
```

Added in v0.6.0

## sat

The `sat` parser constructor takes a predicate function, and will consume
a single character if calling that predicate function with the character
as its argument returns `true`. If it returns `false`, the parser will
fail.

**Signature**

```ts
export declare const sat: <I>(predicate: Predicate<I>) => Parser<I, I>
```

Added in v0.6.0

## succeed

The `succeed` parser constructor creates a parser which will simply
return the value provided as its argument, without consuming any input.

This is equivalent to the monadic `of`.

**Signature**

```ts
export declare const succeed: <I, A>(a: A) => Parser<I, A>
```

Added in v0.6.0

# instances

## Alt

**Signature**

```ts
export declare const Alt: Alt2<'Parser'>
```

Added in v0.6.7

## Alternative

**Signature**

```ts
export declare const Alternative: Alternative2<'Parser'>
```

Added in v0.6.7

## Applicative

**Signature**

```ts
export declare const Applicative: Applicative2<'Parser'>
```

Added in v0.6.7

## Functor

**Signature**

```ts
export declare const Functor: Functor2<'Parser'>
```

Added in v0.6.7

## Monad

**Signature**

```ts
export declare const Monad: Monad2<'Parser'>
```

Added in v0.6.7

## URI

**Signature**

```ts
export declare const URI: 'Parser'
```

Added in v0.6.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.6.0

## getMonoid

**Signature**

```ts
export declare const getMonoid: <I, A>(M: Monoid<A>) => Monoid<Parser<I, A>>
```

Added in v0.6.0

## getSemigroup

**Signature**

```ts
export declare const getSemigroup: <I, A>(S: Semigroup<A>) => Semigroup<Parser<I, A>>
```

Added in v0.6.7

## parser

**Signature**

```ts
export declare const parser: Monad2<'Parser'> & Alternative2<'Parser'>
```

Added in v0.6.7

# model

## Parser (interface)

**Signature**

```ts
export interface Parser<I, A> {
  (i: Stream<I>): ParseResult<I, A>
}
```

Added in v0.6.0

# utils

## bind

**Signature**

```ts
export declare const bind: <N extends string, I, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => Parser<I, B>
) => (fa: Parser<I, A>) => Parser<I, { [K in N | keyof A]: K extends keyof A ? A[K] : B }>
```

Added in v0.6.8

## bindTo

**Signature**

```ts
export declare const bindTo: <N extends string>(name: N) => <I, A>(fa: Parser<I, A>) => Parser<I, { [K in N]: A }>
```

Added in v0.6.8
