---
title: Stream.ts
nav_order: 6
parent: Modules
---

## Stream overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [stream](#stream)
- [destructors](#destructors)
  - [atEnd](#atend)
  - [get](#get)
  - [getAndNext](#getandnext)
- [instances](#instances)
  - [getEq](#geteq)
- [model](#model)
  - [Stream (interface)](#stream-interface)

---

# constructors

## stream

**Signature**

```ts
export declare function stream<A>(buffer: Array<A>, cursor: number = 0): Stream<A>
```

Added in v0.6.0

# destructors

## atEnd

**Signature**

```ts
export declare function atEnd<A>(s: Stream<A>): boolean
```

Added in v0.6.0

## get

**Signature**

```ts
export declare function get<A>(s: Stream<A>): Option<A>
```

Added in v0.6.0

## getAndNext

**Signature**

```ts
export declare function getAndNext<A>(s: Stream<A>): Option<{ value: A; next: Stream<A> }>
```

Added in v0.6.0

# instances

## getEq

**Signature**

```ts
export declare function getEq<A>(E: Eq<A>): Eq<Stream<A>>
```

Added in v0.6.0

# model

## Stream (interface)

**Signature**

```ts
export interface Stream<A> {
  readonly buffer: Array<A>
  readonly cursor: number
}
```

Added in v0.6.0
