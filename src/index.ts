import { Monoid } from 'fp-ts/lib/Monoid'
import { applySecond } from 'fp-ts/lib/Apply'
import { Monad, FantasyMonad } from 'fp-ts/lib/Monad'
import { Alternative, FantasyAlternative } from 'fp-ts/lib/Alternative'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { Option, none, some } from 'fp-ts/lib/Option'
import { fold as foldMonoid } from 'fp-ts/lib/Monoid'

export const URI = 'Parser'

export type URI = typeof URI

export interface ParseFailure {
  remaining: string
  message: string
}

export type ParseSuccess<A> = [A, string]

export type ParseResult<A> = Either<ParseFailure, ParseSuccess<A>>

export class Parser<A> implements FantasyMonad<URI, A>, FantasyAlternative<URI, A> {
  static of = of
  static zero = zero
  readonly _A: A
  readonly _URI: URI
  constructor(public readonly value: (s: string) => ParseResult<A>) {}
  /** Run a parser against an input, either getting an error or a value */
  run(s: string): ParseResult<A> {
    return this.value(s)
  }
  map<B>(f: (a: A) => B): Parser<B> {
    return new Parser(s => this.run(s).map(([a, s1]): [B, string] => [f(a), s1]))
  }
  of<B>(b: B): Parser<B> {
    return of<B>(b)
  }
  ap<B>(fab: Parser<(a: A) => B>): Parser<B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
  chain<B>(f: (a: A) => Parser<B>): Parser<B> {
    return new Parser(s => this.run(s).chain(([a, s1]) => f(a).run(s1)))
  }
  zero<B>(): Parser<B> {
    return zero<B>()
  }
  alt(fa: Parser<A>): Parser<A> {
    return new Parser(s => {
      const e = this.run(s)
      return e.fold(() => fa.run(s), () => e)
    })
  }
}

export function map<A, B>(f: (a: A) => B, fa: Parser<A>): Parser<B> {
  return fa.map(f)
}

export function of<A>(a: A): Parser<A> {
  return new Parser(s => createParseSuccess(a, s))
}

export function ap<A, B>(fab: Parser<(a: A) => B>, fa: Parser<A>): Parser<B> {
  return fa.ap(fab)
}

export function chain<A, B>(f: (a: A) => Parser<B>, fa: Parser<A>): Parser<B> {
  return fa.chain(f)
}

export function alt<A>(fx: Parser<A>, fy: Parser<A>): Parser<A> {
  return fx.alt(fy)
}

export function zero<A>(): Parser<A> {
  return fail
}

export const emptyString = of('')

export function empty(): Parser<string> {
  return emptyString
}

export function concat(x: Parser<string>, y: Parser<string>): Parser<string> {
  return y.ap(x.map(a => (b: string) => a + b))
}

//
// helpers
//

export function createParseFailure<A>(remaining: string, message: string): ParseResult<A> {
  return left<ParseFailure, ParseSuccess<A>>({ remaining, message })
}

export function createParseSuccess<A>(a: A, s: string): ParseResult<A> {
  return right<ParseFailure, ParseSuccess<A>>([a, s])
}

export function consumed<A>(result: ParseResult<A>): Either<ParseFailure, A> {
  return result.map(([a, _]) => a)
}

export function remaining<A>(result: ParseResult<A>): string {
  return result.fold(pe => pe.remaining, ([_, s]) => s)
}

export function getAndNext(s: string): Option<[string, string]> {
  if (s.length > 0) {
    return some<[string, string]>([s.substring(0, 1), s.substring(1)])
  }
  return none
}

/** Get the result of a parse, plus the unparsed input remainder */
export function unparser<A>(parser: Parser<A>, s: string): { consumed: Either<ParseFailure, A>; remaining: string } {
  const e = parser.run(s)
  return { consumed: consumed(e), remaining: remaining(e) }
}

//
// combinators
//

/** Returns a parser which will fail immediately with the provided message */
export function failWith<A>(message: string): Parser<A> {
  return new Parser(s => createParseFailure<A>(s, message))
}

/** The `fail` parser will just fail immediately without consuming any input */
export const fail = failWith<any>('Parse failed on `fail`')

/** A parser combinator which returns the provided parser unchanged, except
 * that if it fails, the provided error message will be returned in the
 * `ParseFailure`.
 */
export function expected<A>(parser: Parser<A>, message: string): Parser<A> {
  return new Parser(s => parser.run(s).mapLeft(({ remaining }) => ({ remaining, message })))
}

/** The `succeed` parser constructor creates a parser which will simply
 * return the value provided as its argument, without consuming any input.
 *
 * This is equivalent to the monadic `of`
 */
export const succeed = of

/** The `item` parser consumes a single value, regardless of what it is,
 * and returns it as its result.
 */
export const item = new Parser<string>(s => {
  return getAndNext(s).fold(
    () => createParseFailure<string>(s, 'Parse failed on item'),
    ([c, s]) => createParseSuccess(c, s)
  )
})

/** The `seq` combinator takes a parser, and a function which will receive
 * the result of that parser if it succeeds, and which should return another
 * parser, which will be run immediately after the initial parser. In this
 * way, you can join parsers together in a sequence, producing more complex
 * parsers.
 *
 * This is equivalent to the monadic `bind` operation.
 */
export const seq = chain

/** The `either` combinator takes two parsers, runs the first on the input
 * stream, and if that fails, it will backtrack and attempt the second
 * parser on the same input. Basically, try parser 1, then try parser 2.
 *
 * This is equivalent to the `alt` operation of `Alt`.
 */
export const either = alt

/** The `sat` parser constructor takes a predicate function, and will consume
 * a single character if calling that predicate function with the character
 * as its argument returns `true`. If it returns `false`, the parser will
 * fail
 */
export function sat(predicate: Predicate<string>): Parser<string> {
  return new Parser(s =>
    getAndNext(s)
      .chain(x => (predicate(x[0]) ? some(x) : none as Option<[string, string]>))
      .fold(() => createParseFailure<string>(s, 'Parse failed on sat'), ([c, s]) => createParseSuccess(c, s))
  )
}

/** The `maybe` parser combinator creates a parser which will run the provided
 * parser on the input, and if it fails, it will returns the empty string (as
 * a result, without consuming any input.
 */
export function maybe(parser: Parser<string>): Parser<string> {
  return parser.alt(empty())
}

export function fold(ps: Array<Parser<string>>): Parser<string> {
  return foldMonoid({ empty, concat }, ps)
}

/** The `many` combinator takes a parser, and returns a new parser which will
 * run the parser repeatedly on the input stream until it fails, returning
 * a list of the result values of each parse operation as its result, or the
 * empty list if the parser never succeeded.
 *
 * Read that as "match this parser zero or more times and give me a list of
 * the results."
 */
export function many<A>(parser: Parser<A>): Parser<Array<A>> {
  return alt(many1(parser).map(a => a.toArray()), of([]))
}

/** The `many1` combinator is just like the `many` combinator, except it
 * requires its wrapped parser to match at least once. The resulting list is
 * thus guaranteed to contain at least one value.
 */
export function many1<A>(parser: Parser<A>): Parser<NonEmptyArray<A>> {
  return parser.chain(head => many(parser).chain(tail => of(new NonEmptyArray(head, tail))))
}

/** Matches the provided parser `p` zero or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 */
export function sepBy<A, B>(sep: Parser<A>, parser: Parser<B>): Parser<Array<B>> {
  return alt(sepBy1(sep, parser).map(a => a.toArray()), alt(parser.map(a => [a]), of([])))
}

/** Matches both parsers and return the value of the second
 */
function second<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<B> {
  return new Parser(s => applySecond({ URI, map, ap })(pa, pb).run(s))
}

/** Matches the provided parser `p` one or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 */
export function sepBy1<A, B>(sep: Parser<A>, parser: Parser<B>): Parser<NonEmptyArray<B>> {
  return parser.chain(head => alt(many(second(sep, parser)), of([])).chain(tail => of(new NonEmptyArray(head, tail))))
}

export const parser: Monad<URI> & Alternative<URI> & Monoid<Parser<string>> = {
  URI,
  map,
  of,
  ap,
  chain,
  zero,
  alt,
  empty,
  concat
}

//
// overloadings
//

import { Curried2, Curried3, Curried4 } from 'fp-ts/lib/function'

declare module 'fp-ts/lib/Functor' {
  interface Ops {
    lift<A, B>(functor: Functor<URI>, f: (a: A) => B): (fa: Parser<A>) => Parser<B>
    voidRight<A, B>(functor: Functor<URI>, a: A, fb: Parser<B>): Parser<A>
    voidLeft<A, B>(functor: Functor<URI>, fa: Parser<A>, b: B): Parser<B>
    flap(functor: Functor<URI>): <A, B>(ff: Parser<(a: A) => B>, a: A) => Parser<B>
  }
}

declare module 'fp-ts/lib/Apply' {
  interface Ops {
    applyFirst(apply: Apply<URI>): <A, B>(fa: Parser<A>, fb: Parser<B>) => Parser<A>
    applySecond(apply: Apply<URI>): <A, B>(fa: Parser<A>, fb: Parser<B>) => Parser<B>
    liftA2<A, B, C>(apply: Apply<URI>, f: Curried2<A, B, C>): (fa: Parser<A>, fb: Parser<B>) => Parser<C>
    liftA3<A, B, C, D>(
      apply: Apply<URI>,
      f: Curried3<A, B, C, D>
    ): (fa: Parser<A>, fb: Parser<B>, fc: Parser<C>) => Parser<D>
    liftA4<A, B, C, D, E>(
      apply: Apply<URI>,
      f: Curried4<A, B, C, D, E>
    ): (fa: Parser<A>, fb: Parser<B>, fc: Parser<C>, fd: Parser<D>) => Parser<E>
  }
}

declare module 'fp-ts/lib/Applicative' {
  interface Ops {
    when(applicative: Applicative<URI>): (condition: boolean, fu: Parser<void>) => Parser<void>
  }
}

declare module 'fp-ts/lib/Chain' {
  interface Ops {
    flatten(chain: Chain<URI>): <A>(mma: Parser<Parser<A>>) => Parser<A>
  }
}
