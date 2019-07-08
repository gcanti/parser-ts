---
title: code-frame.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [run (function)](#run-function)

---

# run (function)

Returns a pretty printed error message using `@babel/code-frame`

**Signature**

```ts
export function run<A>(p: Parser<Char, A>, source: string): Either<string, A> { ... }
```

Added in v0.6.0
