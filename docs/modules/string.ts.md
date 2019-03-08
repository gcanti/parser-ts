---
title: string.ts
nav_order: 3
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [doubleQuote (constant)](#doublequote-constant)
- [doubleQuotedString (constant)](#doublequotedstring-constant)
- [float (constant)](#float-constant)
- [int (constant)](#int-constant)
- [notSpaces (constant)](#notspaces-constant)
- [notSpaces1 (constant)](#notspaces1-constant)
- [spaces (constant)](#spaces-constant)
- [spaces1 (constant)](#spaces1-constant)
- [getAndNext (function)](#getandnext-function)
- [many (function)](#many-function)
- [many1 (function)](#many1-function)
- [oneOf (function)](#oneof-function)
- [string (function)](#string-function)

---

# doubleQuote (constant)

**Signature**

```ts
export const doubleQuote = ...
```

# doubleQuotedString (constant)

Parses a double quoted string, with support for escaping double quotes
inside it, and returns the inner string. Does not perform any other form
of string escaping.

**Signature**

```ts
export const doubleQuotedString = ...
```

# float (constant)

**Signature**

```ts
export const float = ...
```

# int (constant)

**Signature**

```ts
export const int = ...
```

# notSpaces (constant)

Matches zero or more non-whitespace characters.

**Signature**

```ts
export const notSpaces = ...
```

# notSpaces1 (constant)

Matches one or more non-whitespace characters.

**Signature**

```ts
export const notSpaces1 = ...
```

# spaces (constant)

Matches zero or more whitespace characters.

**Signature**

```ts
export const spaces = ...
```

# spaces1 (constant)

Matches one or more whitespace characters.

**Signature**

```ts
export const spaces1 = ...
```

# getAndNext (function)

**Signature**

```ts
export function getAndNext(s: string, prefix: string): Option<[string, string]> { ... }
```

# many (function)

Matches the given parser zero or more times, returning a string of the
entire match

**Signature**

```ts
export function many(parser: P.Parser<string>): P.Parser<string> { ... }
```

# many1 (function)

Matches the given parser one or more times, returning a string of the
entire match

**Signature**

```ts
export function many1(parser: P.Parser<string>): P.Parser<string> { ... }
```

# oneOf (function)

Matches one of a list of strings.

**Signature**

```ts
export function oneOf(ss: Array<string>): P.Parser<string> { ... }
```

# string (function)

Matches the exact string provided.

**Signature**

```ts
export function string(prefix: string): P.Parser<string> { ... }
```
