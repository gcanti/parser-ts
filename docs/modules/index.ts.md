---
title: index.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [ParseFailure (interface)](#parsefailure-interface)
- [ParseResult (type alias)](#parseresult-type-alias)
- [ParseSuccess (type alias)](#parsesuccess-type-alias)
- [URI (type alias)](#uri-type-alias)
- [Parser (class)](#parser-class)
  - [map (method)](#map-method)
  - [ap (method)](#ap-method)
  - [ap\_ (method)](#ap_-method)
  - [applyFirst (method)](#applyfirst-method)
  - [applySecond (method)](#applysecond-method)
  - [chain (method)](#chain-method)
  - [alt (method)](#alt-method)
- [URI (constant)](#uri-constant)
- [either (constant)](#either-constant)
- [eof (constant)](#eof-constant)
- [fail (constant)](#fail-constant)
- [fold (constant)](#fold-constant)
- [item (constant)](#item-constant)
- [parser (constant)](#parser-constant)
- [seq (constant)](#seq-constant)
- [succeed (constant)](#succeed-constant)
- [alts (function)](#alts-function)
- [consumed (function)](#consumed-function)
- [createParseFailure (function)](#createparsefailure-function)
- [createParseSuccess (function)](#createparsesuccess-function)
- [expected (function)](#expected-function)
- [expectedL (function)](#expectedl-function)
- [failWith (function)](#failwith-function)
- [getAndNext (function)](#getandnext-function)
- [many (function)](#many-function)
- [many1 (function)](#many1-function)
- [maybe (function)](#maybe-function)
- [remaining (function)](#remaining-function)
- [sat (function)](#sat-function)
- [second (function)](#second-function)
- [sepBy (function)](#sepby-function)
- [sepBy1 (function)](#sepby1-function)
- [unparser (function)](#unparser-function)

---

# ParseFailure (interface)

**Signature**

```ts
export interface ParseFailure {
  remaining: string
  message: string
}
```

# ParseResult (type alias)

**Signature**

```ts
export type ParseResult<A> = Either<ParseFailure, ParseSuccess<A>>
```

# ParseSuccess (type alias)

**Signature**

```ts
export type ParseSuccess<A> = [A, string]
```

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# Parser (class)

**Signature**

```ts
export class Parser<A> {
  constructor(public readonly run: (s: string) => ParseResult<A>) { ... }
  ...
}
```

## map (method)

**Signature**

```ts
map<B>(f: (a: A) => B): Parser<B> { ... }
```

## ap (method)

**Signature**

```ts
ap<B>(fab: Parser<(a: A) => B>): Parser<B> { ... }
```

## ap\_ (method)

Flipped version of {@link ap}

**Signature**

```ts
ap_<B, C>(this: Parser<(b: B) => C>, fb: Parser<B>): Parser<C> { ... }
```

## applyFirst (method)

Combine two effectful actions, keeping only the result of the first

**Signature**

```ts
applyFirst<B>(fb: Parser<B>): Parser<A> { ... }
```

## applySecond (method)

Combine two effectful actions, keeping only the result of the second

**Signature**

```ts
applySecond<B>(fb: Parser<B>): Parser<B> { ... }
```

## chain (method)

**Signature**

```ts
chain<B>(f: (a: A) => Parser<B>): Parser<B> { ... }
```

## alt (method)

**Signature**

```ts
alt(fa: Parser<A>): Parser<A> { ... }
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# either (constant)

The `either` combinator takes two parsers, runs the first on the input
stream, and if that fails, it will backtrack and attempt the second
parser on the same input. Basically, try parser 1, then try parser 2.

This is equivalent to the `alt` operation of `Alt`.

**Signature**

```ts
export const either = ...
```

# eof (constant)

Matches the end of the input

**Signature**

```ts
export const eof: Parser<undefined> = ...
```

# fail (constant)

The `fail` parser will just fail immediately without consuming any input

**Signature**

```ts
export const fail = ...
```

# fold (constant)

**Signature**

```ts
export const fold: (ps: Array<Parser<string>>) => Parser<string> = ...
```

# item (constant)

The `item` parser consumes a single value, regardless of what it is,
and returns it as its result.

**Signature**

```ts
export const item = ...
```

# parser (constant)

**Signature**

```ts
export const parser: Monad1<URI> & Alternative1<URI> & Monoid<Parser<string>> = ...
```

# seq (constant)

The `seq` combinator takes a parser, and a function which will receive
the result of that parser if it succeeds, and which should return another
parser, which will be run immediately after the initial parser. In this
way, you can join parsers together in a sequence, producing more complex
parsers.

This is equivalent to the monadic `bind` operation.

**Signature**

```ts
export const seq = ...
```

# succeed (constant)

The `succeed` parser constructor creates a parser which will simply
return the value provided as its argument, without consuming any input.

This is equivalent to the monadic `of`

**Signature**

```ts
export const succeed = ...
```

# alts (function)

**Signature**

```ts
export const alts = <A>(...fs: Parser<A>[]): Parser<A> => fs.reduce((fx, fy) => ...
```

# consumed (function)

**Signature**

```ts
export const consumed = <A>(result: ParseResult<A>): Either<ParseFailure, A> => result.map(([a, _]) => ...
```

# createParseFailure (function)

**Signature**

```ts
export const createParseFailure = <A>(remaining: string, message: string): ParseResult<A> => ...
```

# createParseSuccess (function)

**Signature**

```ts
export const createParseSuccess = <A>(a: A, s: string): ParseResult<A> => ...
```

# expected (function)

A parser combinator which returns the provided parser unchanged, except
that if it fails, the provided error message will be returned in the
`ParseFailure`.

**Signature**

```ts
export const expected = <A>(parser: Parser<A>, message: string): Parser<A> => expectedL(parser, () => ...
```

# expectedL (function)

**Signature**

```ts
export const expectedL = <A>(parser: Parser<A>, message: (remaining: string) => string): Parser<A> =>
  new Parser(s => parser.run(s).mapLeft(({ remaining }) => ...
```

# failWith (function)

Returns a parser which will fail immediately with the provided message

**Signature**

```ts
export const failWith = <A>(message: string): Parser<A> => new Parser(s => ...
```

# getAndNext (function)

**Signature**

```ts
export const getAndNext = (s: string): Option<[string, string]> => ...
```

# many (function)

The `many` combinator takes a parser, and returns a new parser which will
run the parser repeatedly on the input stream until it fails, returning
a list of the result values of each parse operation as its result, or the
empty list if the parser never succeeded.

Read that as "match this parser zero or more times and give me a list of
the results."

**Signature**

```ts
export const many = <A>(parser: Parser<A>): Parser<Array<A>> => alt(many1(parser).map(a => ...
```

# many1 (function)

The `many1` combinator is just like the `many` combinator, except it
requires its wrapped parser to match at least once. The resulting list is
thus guaranteed to contain at least one value.

**Signature**

```ts
export const many1 = <A>(parser: Parser<A>): Parser<NonEmptyArray<A>> =>
  parser.chain(head => many(parser).chain(tail => ...
```

# maybe (function)

The `maybe` parser combinator creates a parser which will run the provided
parser on the input, and if it fails, it will returns the empty string (as
a result, without consuming any input.

**Signature**

```ts
export const maybe = (parser: Parser<string>): Parser<string> => ...
```

# remaining (function)

**Signature**

```ts
export const remaining = <A>(result: ParseResult<A>): string => result.fold(pe => pe.remaining, ([_, s]) => ...
```

# sat (function)

The `sat` parser constructor takes a predicate function, and will consume
a single character if calling that predicate function with the character
as its argument returns `true`. If it returns `false`, the parser will
fail

**Signature**

```ts
export const sat = (predicate: Predicate<string>): Parser<string> =>
  new Parser(s =>
    getAndNext(s)
      .chain(x => (predicate(x[0]) ? some(x) : none))
      .foldL(() => createParseFailure(s, 'Parse failed on sat'), ([c, s]) => ...
```

# second (function)

Matches both parsers and return the value of the second

**Signature**

```ts
export const second = <A>(pa: Parser<A>) => <B>(pb: Parser<B>): Parser<B> =>
  new Parser(s => ...
```

# sepBy (function)

Matches the provided parser `p` zero or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export const sepBy = <A, B>(sep: Parser<A>, parser: Parser<B>): Parser<Array<B>> =>
  alt(sepBy1(sep, parser).map(a => ...
```

# sepBy1 (function)

Matches the provided parser `p` one or more times, but requires the
parser `sep` to match once in between each match of `p`. In other words,
use `sep` to match separator characters in between matches of `p`.

**Signature**

```ts
export const sepBy1 = <A, B>(sep: Parser<A>, parser: Parser<B>): Parser<NonEmptyArray<B>> =>
  parser.chain(head => alt(many(second(sep)(parser)), of([])).chain(tail => ...
```

# unparser (function)

Get the result of a parse, plus the unparsed input remainder

**Signature**

```ts
export const unparser = <A>(parser: Parser<A>) => (
  s: string
): { consumed: Either<ParseFailure, A>; remaining: string } => ...
```
