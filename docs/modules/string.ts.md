---
title: string.ts
nav_order: 7
parent: Modules
---

# string overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [doubleQuotedString](#doublequotedstring)
- [float](#float)
- [fold](#fold)
- [int](#int)
- [many](#many)
- [many1](#many1)
- [maybe](#maybe)
- [notSpaces](#notspaces)
- [notSpaces1](#notspaces1)
- [oneOf](#oneof)
- [spaces](#spaces)
- [spaces1](#spaces1)
- [string](#string)

---

# doubleQuotedString

Parses a double quoted string, with support for escaping double quotes
inside it, and returns the inner string. Does not perform any other form
of string escaping.

**Signature**

```ts
export const doubleQuotedString: P.Parser<string, string> = ...
```

Added in v0.6.0

# float

**Signature**

```ts
export const float: P.Parser<C.Char, number> = ...
```

Added in v0.6.0

# fold

**Signature**

```ts
export const fold: <I>(as: Array<P.Parser<I, string>>) => P.Parser<I, string> = ...
```

Added in v0.6.0

# int

**Signature**

```ts
export const int: P.Parser<C.Char, number> = ...
```

Added in v0.6.0

# many

Matches the given parser zero or more times, returning a string of the
entire match

**Signature**

```ts
export function many(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# many1

Matches the given parser one or more times, returning a string of the
entire match

**Signature**

```ts
export function many1(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# maybe

**Signature**

```ts
export const maybe: <I>(p: P.Parser<I, string>) => P.Parser<I, string> = ...
```

Added in v0.6.0

# notSpaces

Matches zero or more non-whitespace characters.

**Signature**

```ts
export const notSpaces: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# notSpaces1

Matches one or more non-whitespace characters.

**Signature**

```ts
export const notSpaces1: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# oneOf

Matches one of a list of strings.

**Signature**

```ts
export function oneOf<F extends URIS>(F: Functor1<F> & Foldable1<F>): (ss: Kind<F, string>) => P.Parser<C.Char, string>
export function oneOf<F>(F: Functor<F> & Foldable<F>): (ss: HKT<F, string>) => P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# spaces

Matches zero or more whitespace characters.

**Signature**

```ts
export const spaces: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# spaces1

Matches one or more whitespace characters.

**Signature**

```ts
export const spaces1: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# string

Matches the exact string provided.

**Signature**

```ts
export function string(s: string): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0
