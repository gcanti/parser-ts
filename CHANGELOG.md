# Changelog

> **Tags:**
>
> - [New Feature]
> - [Bug Fix]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]
> - [Experimental]

**Note**: Gaps between patch versions are faulty/broken releases. **Note**: A feature tagged as Experimental is in a
high state of flux, you're at risk of it changing without notice.

# 0.6.6

- **New Feature**
  - add `lookAhead` and `takeUntil` to `Parser`, #24 (@IMax153)

# 0.6.5

- **Polish**
  - Make `between` and `surroundedBy` polymorphic in return type, #23 (@YBogomolov)

# 0.6.4

- **New Feature**
  - add `between` and `surroundedBy` to `Parser`, #22 (@IMax153)

# 0.6.3

- **Bug Fix**
  - don't set `target: es6` in `tsconfig.build-es6.json` (@gcanti)
- **Internal**
  - upgrade to latest `docs-ts` (@gcanti)

# 0.6.2

- **New Feature**
  - add build in ES6 format (@gcanti)

# 0.6.0

- **Breaking Change**
  - upgrade to `fp-ts@2.x` (@gcanti)
  - move `fp-ts` to `peerDependencies` (@gcanti)
  - update to `purescript-eulalie` v5.0.0 (@gcanti)

# 0.5.1

- **New Feature**
  - add `applyFirst`, `applySecond` and `ap_` to Parser (@gcanti)
  - add `expectedL` function (@gcanti)
- **Internal**
  - upgrade to latest versions + 100% coverage (@gcanti)

# 0.5.0

- **Breaking Change**
  - upgrade to `fp-ts@1.x.x` (@gcanti)

# 0.4.3

- **New Feature**
  - Add n-ary alts combinator, fixes #12 (@danr)

# 0.4.2

- **Bug fix**
  - The whitespace parser only accepts space, fix #10 (@danr, @gcanti)

# 0.4.1

- **New Feature**
  - add `eof` parser, closes #8 (@gcanti)

# 0.4.0

- **Breaking Change**
  - upgrade to latest `fp-ts` (0.6.0) (@gcanti)

# 0.3.0

- **Breaking Change**
  - upgrade to latest `fp-ts` (0.5.1) (@gcanti)

# 0.2.1

- **Internal**
  - upgrade to latest `fp-ts` (0.4.3) (@gcanti)

# 0.2.0

- **Breaking Change**
  - upgrade to latest `fp-ts` (@gcanti)

# 0.1.0

- **Breaking Change**
  - upgrade to latest `fp-ts` (`parser-ts` APIs are not changed though) (@gcanti)
  - drop `lib-jsnext` folder
- **Polish**
  - use fp-ts's `applySecond` (@gcanti)

# 0.0.2

- **Bug Fix**
  - fix `sepBy1`, https://github.com/gcanti/parser-ts/pull/1 (@sledorze)

# 0.0.1

Initial release
