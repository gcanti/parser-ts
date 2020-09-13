/**
 * @since 0.6.0
 */
import { Alt2 } from 'fp-ts/lib/Alt'
import { Alternative2 } from 'fp-ts/lib/Alternative'
import { Applicative2 } from 'fp-ts/lib/Applicative'
import * as A from 'fp-ts/lib/Array'
import { Chain2 } from 'fp-ts/lib/Chain'
import * as E from 'fp-ts/lib/Either'
import { Functor2 } from 'fp-ts/lib/Functor'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import { identity, not, Predicate, Lazy } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { error, escalate, extend, success, withExpected, ParseResult } from './ParseResult'
import { atEnd, getAndNext, Stream } from './Stream'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.6.0
 */
export interface Parser<I, A> {
  (i: Stream<I>): ParseResult<I, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * The `succeed` parser constructor creates a parser which will simply
 * return the value provided as its argument, without consuming any input.
 *
 * This is equivalent to the monadic `of`.
 *
 * @category constructors
 * @since 0.6.0
 */
export const succeed: <I, A>(a: A) => Parser<I, A> = a => i => success(a, i, i)

/**
 * The `fail` parser will just fail immediately without consuming any input
 *
 * @category constructors
 * @since 0.6.0
 */
export const fail: <I, A = never>() => Parser<I, A> = () => i => error(i)

/**
 * The `failAt` parser will fail immediately without consuming any input,
 * but will report the failure at the provided input position.
 *
 * @category constructors
 * @since 0.6.0
 */
export const failAt: <I, A = never>(i: Stream<I>) => Parser<I, A> = i => () => error(i)

/**
 * The `sat` parser constructor takes a predicate function, and will consume
 * a single character if calling that predicate function with the character
 * as its argument returns `true`. If it returns `false`, the parser will
 * fail.
 *
 * @category constructors
 * @since 0.6.0
 */
export const sat = <I>(predicate: Predicate<I>): Parser<I, I> =>
  pipe(
    withStart(item<I>()),
    chain(([a, start]) => (predicate(a) ? of(a) : failAt(start)))
  )

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * A parser combinator which returns the provided parser unchanged, except
 * that if it fails, the provided error message will be returned in the
 * ParseError`.
 *
 * @category combinators
 * @since 0.6.0
 */
export const expected: <I, A>(p: Parser<I, A>, message: string) => Parser<I, A> = (p, message) => i =>
  pipe(
    p(i),
    E.mapLeft(err => withExpected(err, [message]))
  )

/**
 * The `item` parser consumes a single value, regardless of what it is,
 * and returns it as its result.
 *
 * @category combinators
 * @since 0.6.0
 */
export const item: <I>() => Parser<I, I> = () => i =>
  pipe(
    getAndNext(i),
    O.fold(
      () => error(i),
      ({ value, next }) => success(value, next, i)
    )
  )

/**
 * The `cut` parser combinator takes a parser and produces a new parser for
 * which all errors are fatal, causing either to stop trying further
 * parsers and return immediately with a fatal error.
 *
 * @category combinators
 * @since 0.6.0
 */
export const cut: <I, A>(p: Parser<I, A>) => Parser<I, A> = p => i => pipe(p(i), E.mapLeft(escalate))

/**
 * Takes two parsers `p1` and `p2`, returning a parser which will match
 * `p1` first, discard the result, then either match `p2` or produce a fatal
 * error.
 *
 * @category combinators
 * @since 0.6.0
 */
export const cutWith: <I, A, B>(p1: Parser<I, A>, p2: Parser<I, B>) => Parser<I, B> = (p1, p2) =>
  pipe(p1, apSecond(cut(p2)))

/**
 * The `seq` combinator takes a parser, and a function which will receive
 * the result of that parser if it succeeds, and which should return another
 * parser, which will be run immediately after the initial parser. In this
 * way, you can join parsers together in a sequence, producing more complex
 * parsers.
 *
 * This is equivalent to the monadic `chain` operation.
 *
 * @category combinators
 * @since 0.6.0
 */
export const seq: <I, A, B>(fa: Parser<I, A>, f: (a: A) => Parser<I, B>) => Parser<I, B> = (fa, f) => i =>
  pipe(
    fa(i),
    E.chain(s =>
      pipe(
        f(s.value)(s.next),
        E.chain(next => success(next.value, next.next, i))
      )
    )
  )

/**
 * The `either` combinator takes two parsers, runs the first on the input
 * stream, and if that fails, it will backtrack and attempt the second
 * parser on the same input. Basically, try parser 1, then try parser 2.
 *
 * If the first parser fails with an error flagged as fatal (see `cut`),
 * the second parser will not be attempted.
 *
 * This is equivalent to the `alt` operation.
 *
 * @category combinators
 * @since 0.6.0
 */
export const either: <I, A>(p: Parser<I, A>, f: () => Parser<I, A>) => Parser<I, A> = (p, f) => i => {
  const e = p(i)
  if (E.isRight(e)) {
    return e
  }
  if (e.left.fatal) {
    return e
  }
  return pipe(
    f()(i),
    E.mapLeft(err => extend(e.left, err))
  )
}

/**
 * Converts a parser into one which will return the point in the stream where
 * it started parsing in addition to its parsed value.
 *
 * Useful if you want to keep track of where in the input stream a parsed
 * token came from.
 *
 * @category combinators
 * @since 0.6.0
 */
export const withStart: <I, A>(p: Parser<I, A>) => Parser<I, [A, Stream<I>]> = p => i =>
  pipe(
    p(i),
    E.map(s => ({ ...s, value: [s.value, i] }))
  )

/**
 * The `maybe` parser combinator creates a parser which will run the provided
 * parser on the input, and if it fails, it will returns the empty value (as
 * defined by `empty`) as a result, without consuming any input.
 *
 * @category combinators
 * @since 0.6.0
 */
export const maybe: <A>(M: Monoid<A>) => <I>(p: Parser<I, A>) => Parser<I, A> = M => alt(() => of(M.empty))

/**
 * Matches the end of the stream.
 *
 * @category combinators
 * @since 0.6.0
 */
export const eof: <I>() => Parser<I, void> = () =>
  expected(i => (atEnd(i) ? success(undefined, i, i) : error(i)), 'end of file')

/**
 * The `many` combinator takes a parser, and returns a new parser which will
 * run the parser repeatedly on the input stream until it fails, returning
 * a list of the result values of each parse operation as its result, or the
 * empty list if the parser never succeeded.
 *
 * Read that as "match this parser zero or more times and give me a list of
 * the results."
 *
 * @category combinators
 * @since 0.6.0
 */
export const many = <I, A>(p: Parser<I, A>): Parser<I, Array<A>> =>
  pipe(
    many1(p),
    alt(() => of<I, Array<A>>(A.empty))
  )

/**
 * The `many1` combinator is just like the `many` combinator, except it
 * requires its wrapped parser to match at least once. The resulting list is
 * thus guaranteed to contain at least one value.
 *
 * @category combinators
 * @since 0.6.0
 */
export const many1: <I, A>(p: Parser<I, A>) => Parser<I, NEA.NonEmptyArray<A>> = p =>
  pipe(
    p,
    chain(head =>
      pipe(
        many(p),
        map(tail => NEA.cons(head, tail))
      )
    )
  )

/**
 * Matches the provided parser `p` zero or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 *
 * @category combinators
 * @since 0.6.0
 */
export const sepBy = <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, Array<B>> => {
  const nil: Parser<I, Array<B>> = of(A.empty)
  return pipe(
    sepBy1(sep, p),
    alt(() => nil)
  )
}

/**
 * Matches the provided parser `p` one or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 *
 * @category combinators
 * @since 0.6.0
 */
export const sepBy1: <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>) => Parser<I, NEA.NonEmptyArray<B>> = (sep, p) =>
  pipe(
    p,
    chain(head =>
      pipe(
        many(pipe(sep, apSecond(p))),
        map(tail => NEA.cons(head, tail))
      )
    )
  )

/**
 * Like `sepBy1`, but cut on the separator, so that matching a `sep` not
 * followed by a `p` will cause a fatal error.
 *
 * @category combinators
 * @since 0.6.0
 */
export const sepByCut: <I, A, B>(sep: Parser<I, A>, p: Parser<I, B>) => Parser<I, NEA.NonEmptyArray<B>> = (sep, p) =>
  pipe(
    p,
    chain(head =>
      pipe(
        many(cutWith(sep, p)),
        map(tail => NEA.cons(head, tail))
      )
    )
  )

/**
 * Matches the provided parser `p` that occurs between the provided `left` and `right` parsers.
 *
 * `p` is polymorphic in its return type, because in general bounds and actual parser could return different types.
 *
 * @category combinators
 * @since 0.6.4
 */
export const between: <I, A>(left: Parser<I, A>, right: Parser<I, A>) => <B>(p: Parser<I, B>) => Parser<I, B> = (
  left,
  right
) => p =>
  pipe(
    left,
    chain(() => p),
    chainFirst(() => right)
  )

/**
 * Matches the provided parser `p` that is surrounded by the `bound` parser. Shortcut for `between(bound, bound)`.
 *
 * @category combinators
 * @since 0.6.4
 */
export const surroundedBy: <I, A>(bound: Parser<I, A>) => <B>(p: Parser<I, B>) => Parser<I, B> = bound =>
  between(bound, bound)

/**
 * Takes a `Parser` and tries to match it without consuming any input.
 *
 * @example
 * import { run } from 'parser-ts/code-frame'
 * import * as P from 'parser-ts/Parser'
 * import * as S from 'parser-ts/string'
 *
 * const parser = S.fold([
 *   S.string('hello '),
 *    P.lookAhead(S.string('world')),
 *    S.string('wor')
 * ])
 *
 * run(parser, 'hello world')
 * // { _tag: 'Right', right: 'hello worldwor' }
 *
 * @category combinators
 * @since 0.6.6
 */
export const lookAhead: <I, A>(p: Parser<I, A>) => Parser<I, A> = p => i =>
  pipe(
    p(i),
    E.chain(next => success(next.value, i, i))
  )

/**
 * Takes a `Predicate` and continues parsing until the given `Predicate` is satisfied.
 *
 * @example
 * import * as C from 'parser-ts/char'
 * import { run } from 'parser-ts/code-frame'
 * import * as P from 'parser-ts/Parser'
 *
 * const parser = P.takeUntil((c: C.Char) => c === 'w')
 *
 * run(parser, 'hello world')
 * // { _tag: 'Right', right: [ 'h', 'e', 'l', 'l', 'o', ' ' ] }
 *
 * @category combinators
 * @since 0.6.6
 */
export const takeUntil: <I>(predicate: Predicate<I>) => Parser<I, Array<I>> = predicate => many(sat(not(predicate)))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Monad2<URI>['map'] = (ma, f) => i =>
  pipe(
    ma(i),
    E.map(s => ({ ...s, value: f(s.value) }))
  )
const ap_: Monad2<URI>['ap'] = (mab, ma) => chain_(mab, f => map_(ma, f))
const chain_: Chain2<URI>['chain'] = (ma, f) => seq(ma, f)
const alt_: Alt2<URI>['alt'] = (fa, that) => either(fa, that)

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 0.6.7
 */
export const map: <A, B>(f: (a: A) => B) => <I>(fa: Parser<I, A>) => Parser<I, B> = f => fa => map_(fa, f)

/**
 * @category Apply
 * @since 0.6.7
 */
export const ap: <I, A>(fa: Parser<I, A>) => <B>(fab: Parser<I, (a: A) => B>) => Parser<I, B> = fa => fab =>
  ap_(fab, fa)

/**
 * @category Apply
 * @since 0.6.7
 */
export const apFirst: <I, B>(fb: Parser<I, B>) => <A>(fa: Parser<I, A>) => Parser<I, A> = fb => fa =>
  ap_(
    map_(fa, a => () => a),
    fb
  )

/**
 * @category Apply
 * @since 0.6.7
 */
export const apSecond: <I, B>(fb: Parser<I, B>) => <A>(fa: Parser<I, A>) => Parser<I, B> = fb => fa =>
  ap_(
    map_(fa, () => b => b),
    fb
  )

/**
 * @category Applicative
 * @since 0.6.7
 */
export const of: <I, A>(a: A) => Parser<I, A> = succeed

/**
 * @category Monad
 * @since 0.6.7
 */
export const chain: <I, A, B>(f: (a: A) => Parser<I, B>) => (ma: Parser<I, A>) => Parser<I, B> = f => ma =>
  chain_(ma, f)

/**
 * @category Monad
 * @since 0.6.7
 */
export const chainFirst: <I, A, B>(f: (a: A) => Parser<I, B>) => (ma: Parser<I, A>) => Parser<I, A> = f => ma =>
  chain_(ma, a => map_(f(a), () => a))

/**
 * @category Alt
 * @since 0.6.7
 */
export const alt: <I, A>(that: Lazy<Parser<I, A>>) => (fa: Parser<I, A>) => Parser<I, A> = that => fa => alt_(fa, that)

/**
 * @category Monad
 * @since 0.6.7
 */
export const flatten: <I, A>(mma: Parser<I, Parser<I, A>>) => Parser<I, A> = mma => chain_(mma, identity)

/**
 * @category Alternative
 * @since 0.6.7
 */
export const zero: <I, A>() => Parser<I, A> = fail

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.6.0
 */
export const URI = 'Parser'

/**
 * @category instances
 * @since 0.6.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Parser: Parser<E, A>
  }
}

/**
 * @category instances
 * @since 0.6.7
 */
export const getSemigroup: <I, A>(S: Semigroup<A>) => Semigroup<Parser<I, A>> = S => ({
  concat: (x, y) =>
    ap_(
      map_(x, x => y => S.concat(x, y)),
      y
    )
})

/**
 * @category instances
 * @since 0.6.0
 */
export const getMonoid: <I, A>(M: Monoid<A>) => Monoid<Parser<I, A>> = M => ({
  ...getSemigroup(M),
  empty: succeed(M.empty)
})

/**
 * @category instances
 * @since 0.6.7
 */
export const Functor: Functor2<URI> = {
  URI,
  map: map_
}

/**
 * @category instances
 * @since 0.6.7
 */
export const Applicative: Applicative2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of
}

/**
 * @category instances
 * @since 0.6.7
 */
export const Monad: Monad2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_
}

/**
 * @category instances
 * @since 0.6.7
 */
export const Alt: Alt2<URI> = {
  URI,
  map: map_,
  alt: alt_
}

/**
 * @category instances
 * @since 0.6.7
 */
export const Alternative: Alternative2<URI> = {
  URI,
  map: map_,
  of,
  ap: ap_,
  alt: alt_,
  zero: fail
}

/**
 * @category instances
 * @since 0.6.7
 */
export const parser: Monad2<URI> & Alternative2<URI> = {
  URI,
  map: map_,
  of,
  ap: ap_,
  chain: chain_,
  alt: alt_,
  zero: fail
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
const bind_ = <A, N extends string, B>(
  a: A,
  name: Exclude<N, keyof A>,
  b: B
): { [K in keyof A | N]: K extends keyof A ? A[K] : B } => Object.assign({}, a, { [name]: b }) as any

/**
 * @since 0.6.8
 */
export const bindTo = <N extends string>(name: N) => <I, A>(fa: Parser<I, A>): Parser<I, { [K in N]: A }> =>
  pipe(
    fa,
    map(a => bind_({}, name, a))
  )

/**
 * @since 0.6.8
 */
export const bind = <N extends string, I, A, B>(name: Exclude<N, keyof A>, f: (a: A) => Parser<I, B>) => (
  fa: Parser<I, A>
): Parser<I, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> =>
  pipe(
    fa,
    chain(a =>
      pipe(
        f(a),
        map(b => bind_(a, name, b))
      )
    )
  )
