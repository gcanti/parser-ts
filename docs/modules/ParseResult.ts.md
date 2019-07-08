---
title: ParseResult.ts
nav_order: 5
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [ParseError (interface)](#parseerror-interface)
- [ParseSuccess (interface)](#parsesuccess-interface)
- [ParseResult (type alias)](#parseresult-type-alias)
- [error (function)](#error-function)
- [escalate (function)](#escalate-function)
- [extend (function)](#extend-function)
- [success (function)](#success-function)
- [withExpected (function)](#withexpected-function)

---

# ParseError (interface)

**Signature**

```ts
export interface ParseError<I> {
  input: Stream<I>
  expected: Array<string>
  fatal: boolean
}
```

Added in v0.6.0

# ParseSuccess (interface)

**Signature**

```ts
export interface ParseSuccess<I, A> {
  value: A
  next: Stream<I>
  start: Stream<I>
}
```

Added in v0.6.0

# ParseResult (type alias)

**Signature**

```ts
export type ParseResult<I, A> = Either<ParseError<I>, ParseSuccess<I, A>>
```

Added in v0.6.0

# error (function)

**Signature**

```ts
export function error<I, A = never>(
  input: Stream<I>,
  expected: Array<string> = empty,
  fatal: boolean = false
): ParseResult<I, A> { ... }
```

Added in v0.6.0

# escalate (function)

**Signature**

```ts
export function escalate<I>(err: ParseError<I>): ParseError<I> { ... }
```

Added in v0.6.0

# extend (function)

**Signature**

```ts
export function extend<I>(err1: ParseError<I>, err2: ParseError<I>): ParseError<I> { ... }
```

Added in v0.6.0

# success (function)

**Signature**

```ts
export function success<I, A>(value: A, next: Stream<I>, start: Stream<I>): ParseResult<I, A> { ... }
```

Added in v0.6.0

# withExpected (function)

**Signature**

```ts
export function withExpected<I>(err: ParseError<I>, expected: Array<string>): ParseError<I> { ... }
```

Added in v0.6.0
