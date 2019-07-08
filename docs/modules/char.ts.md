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

Added in v0.6.0

# alphanum (constant)

Matches a single letter, digit or underscore character.

**Signature**

```ts
export const alphanum: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# digit (constant)

Matches a single digit.

**Signature**

```ts
export const digit: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# letter (constant)

Matches a single ASCII letter.

**Signature**

```ts
export const letter = ...
```

Added in v0.6.0

# lower (constant)

Matches a single lower case ASCII letter.

**Signature**

```ts
export const lower: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notAlphanum (constant)

Matches a single character which isn't a letter, digit or underscore.

**Signature**

```ts
export const notAlphanum: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notDigit (constant)

Matches a single character which isn't a digit.

**Signature**

```ts
export const notDigit: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notLetter (constant)

Matches a single character which isn't an ASCII letter.

**Signature**

```ts
export const notLetter: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notLower (constant)

Matches a single character which isn't a lower case ASCII letter.

**Signature**

```ts
export const notLower: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notSpace (constant)

Matches a single character which isn't whitespace.

**Signature**

```ts
export const notSpace: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# notUpper (constant)

Matches a single character which isn't an upper case ASCII letter.

**Signature**

```ts
export const notUpper: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# space (constant)

Matches a single whitespace character.

**Signature**

```ts
export const space: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# upper (constant)

Matches a single upper case ASCII letter.

**Signature**

```ts
export const upper: P.Parser<Char, Char> = ...
```

Added in v0.6.0

# char (function)

The `char` parser constructor returns a parser which matches only the
specified single character

**Signature**

```ts
export function char(c: Char): P.Parser<Char, Char> { ... }
```

Added in v0.6.0

# many (function)

Takes a `Parser<Char, string>` and matches it zero or more times, returning
a `string` of what was matched.

**Signature**

```ts
export function many(parser: P.Parser<Char, Char>): P.Parser<Char, string> { ... }
```

Added in v0.6.0

# many1 (function)

Takes a `Parser<Char, string>` and matches it one or more times, returning
a `string` of what was matched.

**Signature**

```ts
export function many1(parser: P.Parser<Char, Char>): P.Parser<Char, string> { ... }
```

Added in v0.6.0

# notChar (function)

The `notChar` parser constructor makes a parser which will match any
single character other than the one provided.

**Signature**

```ts
export function notChar(c: Char): P.Parser<Char, Char> { ... }
```

Added in v0.6.0

# notOneOf (function)

Matches a single character which isn't a character from the provided string.

**Signature**

```ts
export function notOneOf(s: string): P.Parser<Char, Char> { ... }
```

Added in v0.6.0

# oneOf (function)

Matches any one character from the provided string.

**Signature**

```ts
export function oneOf(s: string): P.Parser<Char, Char> { ... }
```

Added in v0.6.0
