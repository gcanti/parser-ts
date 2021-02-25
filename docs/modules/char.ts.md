---
title: char.ts
nav_order: 1
parent: Modules
---

## char overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [alphanum](#alphanum)
  - [digit](#digit)
  - [lower](#lower)
  - [many](#many)
  - [many1](#many1)
  - [notAlphanum](#notalphanum)
  - [notDigit](#notdigit)
  - [notLetter](#notletter)
  - [notLower](#notlower)
  - [notSpace](#notspace)
  - [notUpper](#notupper)
  - [space](#space)
  - [upper](#upper)
- [constructors](#constructors)
  - [char](#char)
  - [notChar](#notchar)
  - [notOneOf](#notoneof)
  - [oneOf](#oneof)
- [model](#model)
  - [Char (type alias)](#char-type-alias)
- [utils](#utils)
  - [letter](#letter)

---

# combinators

## alphanum

Matches a single letter, digit or underscore character.

**Signature**

```ts
export declare const alphanum: P.Parser<string, string>
```

Added in v0.6.0

## digit

Matches a single digit.

**Signature**

```ts
export declare const digit: P.Parser<string, string>
```

Added in v0.6.0

## lower

Matches a single lower case ASCII letter.

**Signature**

```ts
export declare const lower: P.Parser<string, string>
```

Added in v0.6.0

## many

Takes a `Parser<Char, string>` and matches it zero or more times, returning
a `string` of what was matched.

**Signature**

```ts
export declare const many: (parser: P.Parser<Char, Char>) => P.Parser<Char, string>
```

Added in v0.6.0

## many1

Takes a `Parser<Char, string>` and matches it one or more times, returning
a `string` of what was matched.

**Signature**

```ts
export declare const many1: (parser: P.Parser<Char, Char>) => P.Parser<Char, string>
```

Added in v0.6.0

## notAlphanum

Matches a single character which isn't a letter, digit or underscore.

**Signature**

```ts
export declare const notAlphanum: P.Parser<string, string>
```

Added in v0.6.0

## notDigit

Matches a single character which isn't a digit.

**Signature**

```ts
export declare const notDigit: P.Parser<string, string>
```

Added in v0.6.0

## notLetter

Matches a single character which isn't an ASCII letter.

**Signature**

```ts
export declare const notLetter: P.Parser<string, string>
```

Added in v0.6.0

## notLower

Matches a single character which isn't a lower case ASCII letter.

**Signature**

```ts
export declare const notLower: P.Parser<string, string>
```

Added in v0.6.0

## notSpace

Matches a single character which isn't whitespace.

**Signature**

```ts
export declare const notSpace: P.Parser<string, string>
```

Added in v0.6.0

## notUpper

Matches a single character which isn't an upper case ASCII letter.

**Signature**

```ts
export declare const notUpper: P.Parser<string, string>
```

Added in v0.6.0

## space

Matches a single whitespace character.

**Signature**

```ts
export declare const space: P.Parser<string, string>
```

Added in v0.6.0

## upper

Matches a single upper case ASCII letter.

**Signature**

```ts
export declare const upper: P.Parser<string, string>
```

Added in v0.6.0

# constructors

## char

The `char` parser constructor returns a parser which matches only the
specified single character

**Signature**

```ts
export declare const char: (c: Char) => P.Parser<Char, Char>
```

Added in v0.6.0

## notChar

The `notChar` parser constructor makes a parser which will match any
single character other than the one provided.

**Signature**

```ts
export declare const notChar: (c: Char) => P.Parser<Char, Char>
```

Added in v0.6.0

## notOneOf

Matches a single character which isn't a character from the provided string.

**Signature**

```ts
export declare const notOneOf: (s: string) => P.Parser<Char, Char>
```

Added in v0.6.0

## oneOf

Matches any one character from the provided string.

**Signature**

```ts
export declare const oneOf: (s: string) => P.Parser<Char, Char>
```

Added in v0.6.0

# model

## Char (type alias)

**Signature**

```ts
export type Char = string
```

Added in v0.6.0

# utils

## letter

Matches a single ASCII letter.

**Signature**

```ts
export declare const letter: P.Parser<string, string>
```

Added in v0.6.0
