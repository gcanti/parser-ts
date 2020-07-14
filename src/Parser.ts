/**
 * @since 0.6.0
 */
import { Alternative2 } from 'fp-ts/lib/Alternative'
import { empty } from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { not, Predicate } from 'fp-ts/lib/function'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { cons, NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import { error, escalate, extend, ParseResult, success, withExpected } from './ParseResult'
import { atEnd, getAndNext, Stream } from './Stream'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Parser: Parser<E, A>
  }
}

/**
 * @since 0.6.0
 */
export const URI = 'Parser'

/**
 * @since 0.6.0
 */
export type URI = typeof URI

/**
 * @since 0.6.0
 */
export interface Parser<I, A> {
  (i: Stream<I>): ParseResult<I, A>
}

/**
 * The `succeed` parser constructor creates a parser which will simply
 * return the value provided as its argument, without consuming any input.
 *
 * This is equivalent to the monadic `of`.
 *
 * @since 0.6.0
 */
export function succeed<I, A>(a: A): Parser<I, A> {
  return i => success(a, i, i)
}

/**
 * The `fail` parser will just fail immediately without consuming any input
 *
 * @since 0.6.0
 */
export function fail<I, A = never>(): Parser<I, A> {
  return i => error(i)
}

/**
 * The `failAt` parser will fail immediately without consuming any input,
 * but will report the failure at the provided input position.
 *
 * @since 0.6.0
 */
export function failAt<I, A = never>(i: Stream<I>): Parser<I, A> {
  return () => error(i)
}

/**
 * A parser combinator which returns the provided parser unchanged, except
 * that if it fails, the provided error message will be returned in the
 * ParseError`.
 *
 * @since 0.6.0
 */
export function expected<I, A>(p: Parser<I, A>, message: string): Parser<I, A> {
  return i =>
    pipe(
      p(i),
      E.mapLeft(err => withExpected(err, [message]))
    )
}

/**
 * The `item` parser consumes a single value, regardless of what it is,
 * and returns it as its result.
 *
 * @since 0.6.0
 */
export function item<I>(): Parser<I, I> {
  return i =>
    pipe(
      getAndNext(i),
      O.fold(
        () => error(i),
        ({ value, next }) => success(value, next, i)
      )
    )
}

/**
 * The `cut` parser combinator takes a parser and produces a new parser for
 * which all errors are fatal, causing either to stop trying further
 * parsers and return immediately with a fatal error.
 *
 * @since 0.6.0
 */
export function cut<I, A>(p: Parser<I, A>): Parser<I, A> {
  return i => pipe(p(i), E.mapLeft(escalate))
}

/**
 * Takes two parsers `p1` and `p2`, returning a parser which will match
 * `p1` first, discard the result, then either match `p2` or produce a fatal
 * error.
 *
 * @since 0.6.0
 */
export function cutWith<I, A, B>(p1: Parser<I, A>, p2: Parser<I, B>): Parser<I, B> {
  return pipe(p1, apSecond(cut(p2)))
}

/**
 * The `seq` combinator takes a parser, and a function which will receive
 * the result of that parser if it succeeds, and which should return another
 * parser, which will be run immediately after the initial parser. In this
 * way, you can join parsers together in a sequence, producing more complex
 * parsers.
 *
 * This is equivalent to the monadic `chain` operation.
 *
 * @since 0.6.0
 */
export function seq<I, A, B>(fa: Parser<I, A>, f: (a: A) => Parser<I, B>): Parser<I, B> {
  return i => E.either.chain(fa(i), s => E.either.chain(f(s.value)(s.next), next => success(next.value, next.next, i)))
}

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
 * @since 0.6.0
 */
export function either<I, A>(p: Parser<I, A>, f: () => Parser<I, A>): Parser<I, A> {
  return i => {
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
}

/**
 * Converts a parser into one which will return the point in the stream where
 * it started parsing in addition to its parsed value.
 *
 * Useful if you want to keep track of where in the input stream a parsed
 * token came from.
 *
 * @since 0.6.0
 */
export function withStart<I, A>(p: Parser<I, A>): Parser<I, [A, Stream<I>]> {
  return i =>
    pipe(
      p(i),
      E.map(s => ({ ...s, value: [s.value, i] }))
    )
}

/**
 * The `sat` parser constructor takes a predicate function, and will consume
 * a single character if calling that predicate function with the character
 * as its argument returns `true`. If it returns `false`, the parser will
 * fail.
 *
 * @since 0.6.0
 */
export function sat<I>(predicate: Predicate<I>): Parser<I, I> {
  return pipe(
    withStart(item<I>()),
    chain(([a, start]) => (predicate(a) ? parser.of(a) : failAt(start)))
  )
}

/**
 * The `maybe` parser combinator creates a parser which will run the provided
 * parser on the input, and if it fails, it will returns the empty value (as
 * defined by `empty`) as a result, without consuming any input.
 *
 * @since 0.6.0
 */
export function maybe<A>(M: Monoid<A>): <I>(p: Parser<I, A>) => Parser<I, A> {
  return alt(() => parser.of(M.empty))
}

/**
 * Matches the end of the stream.
 *
 * @since 0.6.0
 */
export function eof<I>(): Parser<I, void> {
  return expected(i => (atEnd(i) ? success(undefined, i, i) : error(i)), 'end of file')
}

/**
 * The `many` combinator takes a parser, and returns a new parser which will
 * run the parser repeatedly on the input stream until it fails, returning
 * a list of the result values of each parse operation as its result, or the
 * empty list if the parser never succeeded.
 *
 * Read that as "match this parser zero or more times and give me a list of
 * the results."
 *
 * @since 0.6.0
 */
export function many<I, A>(p: Parser<I, A>): Parser<I, Array<A>> {
  return pipe(
    many1(p),
    alt(() => parser.of<I, Array<A>>(empty))
  )
}

/**
 * The `many1` combinator is just like the `many` combinator, except it
 * requires its wrapped parser to match at least once. The resulting list is
 * thus guaranteed to contain at least one value.
 *
 * @since 0.6.0
 */
export function many1<I, A>(p: Parser<I, A>): Parser<I, NonEmptyArray<A>> {
  return parser.chain(p, head => parser.map(many(p), tail => cons(head, tail)))
}

/**
 * Matches the provided parser `p` zero or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 *
 * @since 0.6.0
 */
export function sepBy<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, Array<B>> {
  const nil: Parser<I, Array<B>> = parser.of(empty)
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
 * @since 0.6.0
 */
export function sepBy1<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, NonEmptyArray<B>> {
  const bs = many(pipe(sep, apSecond(p)))
  return parser.chain(p, head => parser.map(bs, tail => cons(head, tail)))
}

/**
 * Like `sepBy1`, but cut on the separator, so that matching a `sep` not
 * followed by a `p` will cause a fatal error.
 * @since 0.6.0
 */
export function sepByCut<I, A, B>(sep: Parser<I, A>, p: Parser<I, B>): Parser<I, NonEmptyArray<B>> {
  const bs = many(cutWith(sep, p))
  return parser.chain(p, head => parser.map(bs, tail => cons(head, tail)))
}

/**
 * Matches the provided parser `p` that occurs between the provided `left` and `right` parsers.
 *
 * `p` is polymorphic in its return type, because in general bounds and actual parser could return different types.
 *
 * @since 0.6.4
 */
export function between<I, A>(left: Parser<I, A>, right: Parser<I, A>): <B>(p: Parser<I, B>) => Parser<I, B> {
  return p =>
    pipe(
      left,
      chain(() => p),
      chainFirst(() => right)
    )
}

/**
 * Matches the provided parser `p` that is surrounded by the `bound` parser. Shortcut for `between(bound, bound)`.
 *
 * @since 0.6.4
 */
export function surroundedBy<I, A>(bound: Parser<I, A>): <B>(p: Parser<I, B>) => Parser<I, B> {
  return between(bound, bound)
}

/**
 * Takes a `Parser` and tries to match it without consuming any input.
 *
 * @example
 * import { run } from 'parser-ts/lib/code-frame'
 * import * as P from 'parser-ts/lib/Parser'
 * import * as S from 'parser-ts/lib/string'
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
 * @since 0.6.6
 */
export const lookAhead = <I, A>(p: Parser<I, A>): Parser<I, A> => i =>
  E.either.chain(p(i), next => success(next.value, i, i))

/**
 * Takes a `Predicate` and continues parsing until the given `Predicate` is satisfied.
 *
 * @example
 * import * as C from 'parser-ts/lib/char'
 * import { run } from 'parser-ts/lib/code-frame'
 * import * as P from 'parser-ts/lib/Parser'
 *
 * const parser = P.takeUntil((c: C.Char) => c === 'w')
 *
 * run(parser, 'hello world')
 * // { _tag: 'Right', right: [ 'h', 'e', 'l', 'l', 'o', ' ' ] }
 *
 * @since 0.6.6
 */
export const takeUntil = <I>(predicate: Predicate<I>): Parser<I, Array<I>> => many(sat(not(predicate)))

/**
 * @since 0.6.0
 */
export function getMonoid<I, A>(M: Monoid<A>): Monoid<Parser<I, A>> {
  return {
    concat: (x, y) =>
      parser.ap(
        parser.map(x, (x: A) => (y: A) => M.concat(x, y)),
        y
      ),
    empty: succeed(M.empty)
  }
}

/**
 * @since 0.6.0
 */
export const parser: Monad2<URI> & Alternative2<URI> = {
  URI,
  map: (fa, f) => i => E.either.map(fa(i), s => ({ ...s, value: f(s.value) })),
  of: succeed,
  ap: (fab, fa) => parser.chain(fab, f => parser.map(fa, f)),
  chain: seq,
  alt: either,
  zero: fail
}

const { alt, ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(parser)

export {
  /**
   * @since 0.6.0
   */
  alt,
  /**
   * @since 0.6.0
   */
  ap,
  /**
   * @since 0.6.0
   */
  apFirst,
  /**
   * @since 0.6.0
   */
  apSecond,
  /**
   * @since 0.6.0
   */
  chain,
  /**
   * @since 0.6.0
   */
  chainFirst,
  /**
   * @since 0.6.0
   */
  flatten,
  /**
   * @since 0.6.0
   */
  map
}
