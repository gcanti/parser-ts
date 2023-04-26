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
export declare const stream: <A>(buffer: A[], cursor?: number | undefined) => Stream<A>
```

Added in v0.6.0

# destructors

## atEnd

**Signature**

```ts
export declare const atEnd: <A>(s: Stream<A>) => boolean
```

Added in v0.6.0

## get

**Signature**

```ts
export declare const get: <A>(s: Stream<A>) => Option<A>
```

Added in v0.6.0

## getAndNext

**Signature**

```ts
export declare const getAndNext: <A>(s: Stream<A>) => Option<{ value: A; next: Stream<A> }>
```

Added in v0.6.0

# instances

## getEq

**Signature**

```ts
export declare const getEq: <A>(E: Eq<A>) => Eq<Stream<A>>
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
