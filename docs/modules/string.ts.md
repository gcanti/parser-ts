---
title: string.ts
nav_order: 7
parent: Modules
---

# string overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [doubleQuotedString (constant)](#doublequotedstring-constant)
- [float (constant)](#float-constant)
- [fold (constant)](#fold-constant)
- [int (constant)](#int-constant)
- [maybe (constant)](#maybe-constant)
- [notSpaces (constant)](#notspaces-constant)
- [notSpaces1 (constant)](#notspaces1-constant)
- [spaces (constant)](#spaces-constant)
- [spaces1 (constant)](#spaces1-constant)
- [many (function)](#many-function)
- [many1 (function)](#many1-function)
- [oneOf (function)](#oneof-function)
- [string (function)](#string-function)

---

# doubleQuotedString (constant)

Parses a double quoted string, with support for escaping double quotes
inside it, and returns the inner string. Does not perform any other form
of string escaping.

**Signature**

```ts
export const doubleQuotedString: P.Parser<string, string> = ...
```

Added in v0.6.0

# float (constant)

**Signature**

```ts
export const float: P.Parser<C.Char, number> = ...
```

Added in v0.6.0

# fold (constant)

**Signature**

```ts
export const fold: <I>(as: Array<P.Parser<I, string>>) => P.Parser<I, string> = ...
```

Added in v0.6.0

# int (constant)

**Signature**

```ts
export const int: P.Parser<C.Char, number> = ...
```

Added in v0.6.0

# maybe (constant)

**Signature**

```ts
export const maybe: <I>(p: P.Parser<I, string>) => P.Parser<I, string> = ...
```

Added in v0.6.0

# notSpaces (constant)

Matches zero or more non-whitespace characters.

**Signature**

```ts
export const notSpaces: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# notSpaces1 (constant)

Matches one or more non-whitespace characters.

**Signature**

```ts
export const notSpaces1: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# spaces (constant)

Matches zero or more whitespace characters.

**Signature**

```ts
export const spaces: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# spaces1 (constant)

Matches one or more whitespace characters.

**Signature**

```ts
export const spaces1: P.Parser<C.Char, string> = ...
```

Added in v0.6.0

# many (function)

Matches the given parser zero or more times, returning a string of the
entire match

**Signature**

```ts
export function many(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# many1 (function)

Matches the given parser one or more times, returning a string of the
entire match

**Signature**

```ts
export function many1(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# oneOf (function)

Matches one of a list of strings.

**Signature**

```ts
export function oneOf<F extends URIS>(F: Functor1<F> & Foldable1<F>): (ss: Kind<F, string>) => P.Parser<C.Char, string>
export function oneOf<F>(F: Functor<F> & Foldable<F>): (ss: HKT<F, string>) => P.Parser<C.Char, string> { ... }
```

Added in v0.6.0

# string (function)

Matches the exact string provided.

**Signature**

```ts
export function string(s: string): P.Parser<C.Char, string> { ... }
```

Added in v0.6.0
