---
title: char.ts
nav_order: 1
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [Char (type alias)](#char-type-alias)
- [alphanum (constant)](#alphanum-constant)
- [digit (constant)](#digit-constant)
- [letter (constant)](#letter-constant)
- [lower (constant)](#lower-constant)
- [notAlphanum (constant)](#notalphanum-constant)
- [notDigit (constant)](#notdigit-constant)
- [notLetter (constant)](#notletter-constant)
- [notLower (constant)](#notlower-constant)
- [notSpace (constant)](#notspace-constant)
- [notUpper (constant)](#notupper-constant)
- [space (constant)](#space-constant)
- [upper (constant)](#upper-constant)
- [char (function)](#char-function)
- [many (function)](#many-function)
- [many1 (function)](#many1-function)
- [notChar (function)](#notchar-function)
- [notOneOf (function)](#notoneof-function)
- [oneOf (function)](#oneof-function)

---

# Char (type alias)

**Signature**

```ts
export type Char = string
```

# alphanum (constant)

Matches a single letter, digit or underscore character.

**Signature**

```ts
export const alphanum = ...
```

# digit (constant)

Matches a single digit.

**Signature**

```ts
export const digit = ...
```

# letter (constant)

Matches a single ASCII letter.

**Signature**

```ts
export const letter = ...
```

# lower (constant)

Matches a single lower case ASCII letter.

**Signature**

```ts
export const lower = ...
```

# notAlphanum (constant)

Matches a single character which isn't a letter, digit or underscore.

**Signature**

```ts
export const notAlphanum = ...
```

# notDigit (constant)

Matches a single character which isn't a digit.

**Signature**

```ts
export const notDigit = ...
```

# notLetter (constant)

Matches a single character which isn't an ASCII letter.

**Signature**

```ts
export const notLetter = ...
```

# notLower (constant)

Matches a single character which isn't a lower case ASCII letter.

**Signature**

```ts
export const notLower = ...
```

# notSpace (constant)

Matches a single character which isn't whitespace.

**Signature**

```ts
export const notSpace = ...
```

# notUpper (constant)

Matches a single character which isn't an upper case ASCII letter.

**Signature**

```ts
export const notUpper = ...
```

# space (constant)

Matches a single whitespace character.

**Signature**

```ts
export const space = ...
```

# upper (constant)

Matches a single upper case ASCII letter.

**Signature**

```ts
export const upper = ...
```

# char (function)

The `char` parser constructor returns a parser which matches only the
specified single character

**Signature**

```ts
export function char(c: Char): P.Parser<Char> { ... }
```

# many (function)

Takes a `P.Parser<string>` and matches it zero or more times, returning
a `String` of what was matched.

**Signature**

```ts
export function many(parser: P.Parser<Char>): P.Parser<string> { ... }
```

# many1 (function)

Takes a `P.Parser<string>` and matches it one or more times, returning
a `String` of what was matched.

**Signature**

```ts
export function many1(parser: P.Parser<Char>): P.Parser<string> { ... }
```

# notChar (function)

The `notChar` parser constructor makes a parser which will match any
single character other than the one provided.

**Signature**

```ts
export function notChar(c: Char): P.Parser<Char> { ... }
```

# notOneOf (function)

Matches a single character which isn't a character from the provided string.

**Signature**

```ts
export function notOneOf(s: string): P.Parser<Char> { ... }
```

# oneOf (function)

Matches any one character from the provided string.

**Signature**

```ts
export function oneOf(s: string): P.Parser<Char> { ... }
```
