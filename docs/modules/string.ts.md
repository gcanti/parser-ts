---
title: string.ts
nav_order: 7
parent: Modules
---

## string overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [doubleQuotedString](#doublequotedstring)
  - [float](#float)
  - [int](#int)
  - [many](#many)
  - [many1](#many1)
  - [maybe](#maybe)
  - [notSpaces](#notspaces)
  - [notSpaces1](#notspaces1)
  - [run](#run)
  - [spaces](#spaces)
  - [spaces1](#spaces1)
- [constructors](#constructors)
  - [oneOf](#oneof)
  - [string](#string)
- [destructors](#destructors)
  - [fold](#fold)

---

# combinators

## doubleQuotedString

Parses a double quoted string, with support for escaping double quotes
inside it, and returns the inner string. Does not perform any other form
of string escaping.

**Signature**

```ts
export declare const doubleQuotedString: P.Parser<string, string>
```

Added in v0.6.0

## float

**Signature**

```ts
export declare const float: P.Parser<string, number>
```

Added in v0.6.0

## int

**Signature**

```ts
export declare const int: P.Parser<string, number>
```

Added in v0.6.0

## many

Matches the given parser zero or more times, returning a string of the
entire match

**Signature**

```ts
export declare const many: (parser: P.Parser<C.Char, string>) => P.Parser<C.Char, string>
```

Added in v0.6.0

## many1

Matches the given parser one or more times, returning a string of the
entire match

**Signature**

```ts
export declare const many1: (parser: P.Parser<C.Char, string>) => P.Parser<C.Char, string>
```

Added in v0.6.0

## maybe

**Signature**

```ts
export declare const maybe: <I>(p: P.Parser<I, string>) => P.Parser<I, string>
```

Added in v0.6.0

## notSpaces

Matches zero or more non-whitespace characters.

**Signature**

```ts
export declare const notSpaces: P.Parser<string, string>
```

Added in v0.6.0

## notSpaces1

Matches one or more non-whitespace characters.

**Signature**

```ts
export declare const notSpaces1: P.Parser<string, string>
```

Added in v0.6.0

## run

**Signature**

```ts
export declare function run(string: string): <A>(p: P.Parser<C.Char, A>) => PR.ParseResult<C.Char, A>
```

Added in v0.6.8

## spaces

Matches zero or more whitespace characters.

**Signature**

```ts
export declare const spaces: P.Parser<string, string>
```

Added in v0.6.0

## spaces1

Matches one or more whitespace characters.

**Signature**

```ts
export declare const spaces1: P.Parser<string, string>
```

Added in v0.6.0

# constructors

## oneOf

Matches one of a list of strings.

**Signature**

```ts
export declare function oneOf<F extends URIS>(
  F: Functor1<F> & Foldable1<F>
): (ss: Kind<F, string>) => P.Parser<C.Char, string>
export declare function oneOf<F>(F: Functor<F> & Foldable<F>): (ss: HKT<F, string>) => P.Parser<C.Char, string>
```

Added in v0.6.0

## string

Matches the exact string provided.

**Signature**

```ts
export declare const string: (s: string) => P.Parser<C.Char, string>
```

Added in v0.6.0

# destructors

## fold

**Signature**

```ts
export declare const fold: <I>(as: P.Parser<I, string>[]) => P.Parser<I, string>
```

Added in v0.6.0
