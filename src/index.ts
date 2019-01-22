import { Monoid, fold as foldMonoid } from 'fp-ts/lib/Monoid'
import { applySecond } from 'fp-ts/lib/Apply'
import { Monad1 } from 'fp-ts/lib/Monad'
import { Alternative1 } from 'fp-ts/lib/Alternative'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Predicate, tuple } from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import { Option, none, some } from 'fp-ts/lib/Option'

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Parser: Parser<A>
  }
}

export const URI = 'Parser'

export type URI = typeof URI

export interface ParseFailure {
  remaining: string
  message: string
}

export type ParseSuccess<A> = [A, string]

export type ParseResult<A> = Either<ParseFailure, ParseSuccess<A>>

export class Parser<A> {
  readonly _A!: A
  readonly _URI!: URI
  constructor(public readonly run: (s: string) => ParseResult<A>) {}
  map<B>(f: (a: A) => B): Parser<B> {
    return new Parser(s => this.run(s).map(([a, s1]): [B, string] => [f(a), s1]))
  }
  ap<B>(fab: Parser<(a: A) => B>): Parser<B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
  chain<B>(f: (a: A) => Parser<B>): Parser<B> {
    return new Parser(s => this.run(s).chain(([a, s1]) => f(a).run(s1)))
  }
  alt(fa: Parser<A>): Parser<A> {
    return new Parser(s => {
      const e = this.run(s)
      return e.fold(() => fa.run(s), () => e)
    })
  }
}

const map = <A, B>(fa: Parser<A>, f: (a: A) => B): Parser<B> => fa.map(f)

const of = <A>(a: A): Parser<A> => new Parser(s => createParseSuccess(a, s))

const ap = <A, B>(fab: Parser<(a: A) => B>, fa: Parser<A>): Parser<B> => fa.ap(fab)

const chain = <A, B>(fa: Parser<A>, f: (a: A) => Parser<B>): Parser<B> => fa.chain(f)

const alt = <A>(fx: Parser<A>, fy: Parser<A>): Parser<A> => fx.alt(fy)

const zero = <A>(): Parser<A> => fail

const empty: Parser<string> = of('')

const concat = (x: Parser<string>, y: Parser<string>): Parser<string> => y.ap(x.map(a => (b: string) => a + b))

export const alts = <A>(...fs: Parser<A>[]): Parser<A> => fs.reduce((fx, fy) => fx.alt(fy), fail)

//
// helpers
//

export const createParseFailure = <A>(remaining: string, message: string): ParseResult<A> =>
  left({ remaining, message })

export const createParseSuccess = <A>(a: A, s: string): ParseResult<A> => right<ParseFailure, ParseSuccess<A>>([a, s])

export const consumed = <A>(result: ParseResult<A>): Either<ParseFailure, A> => result.map(([a, _]) => a)

export const remaining = <A>(result: ParseResult<A>): string => result.fold(pe => pe.remaining, ([_, s]) => s)

export const getAndNext = (s: string): Option<[string, string]> =>
  s.length > 0 ? some(tuple(s.substring(0, 1), s.substring(1))) : none

/** Get the result of a parse, plus the unparsed input remainder */
export const unparser = <A>(parser: Parser<A>) => (
  s: string
): { consumed: Either<ParseFailure, A>; remaining: string } => {
  const e = parser.run(s)
  return { consumed: consumed(e), remaining: remaining(e) }
}

//
// combinators
//

/** Returns a parser which will fail immediately with the provided message */
export const failWith = <A>(message: string): Parser<A> => new Parser(s => createParseFailure<A>(s, message))

/** The `fail` parser will just fail immediately without consuming any input */
export const fail = failWith<never>('Parse failed on `fail`')

/**
 * The `succeed` parser constructor creates a parser which will simply
 * return the value provided as its argument, without consuming any input.
 *
 * This is equivalent to the monadic `of`
 */
export const succeed = of

/**
 * A parser combinator which returns the provided parser unchanged, except
 * that if it fails, the provided error message will be returned in the
 * `ParseFailure`.
 */
export const expected = <A>(parser: Parser<A>, message: string): Parser<A> =>
  new Parser(s => parser.run(s).mapLeft(({ remaining }) => ({ remaining, message })))

/** The `item` parser consumes a single value, regardless of what it is,
 * and returns it as its result.
 */
export const item = new Parser<string>(s => {
  return getAndNext(s).foldL(() => createParseFailure(s, 'Parse failed on item'), ([c, s]) => createParseSuccess(c, s))
})

/**
 * The `seq` combinator takes a parser, and a function which will receive
 * the result of that parser if it succeeds, and which should return another
 * parser, which will be run immediately after the initial parser. In this
 * way, you can join parsers together in a sequence, producing more complex
 * parsers.
 *
 * This is equivalent to the monadic `bind` operation.
 */
export const seq = chain

/**
 * The `either` combinator takes two parsers, runs the first on the input
 * stream, and if that fails, it will backtrack and attempt the second
 * parser on the same input. Basically, try parser 1, then try parser 2.
 *
 * This is equivalent to the `alt` operation of `Alt`.
 */
export const either = alt

/**
 * The `sat` parser constructor takes a predicate function, and will consume
 * a single character if calling that predicate function with the character
 * as its argument returns `true`. If it returns `false`, the parser will
 * fail
 */
export const sat = (predicate: Predicate<string>): Parser<string> =>
  new Parser(s =>
    getAndNext(s)
      .chain(x => (predicate(x[0]) ? some(x) : none))
      .foldL(() => createParseFailure(s, 'Parse failed on sat'), ([c, s]) => createParseSuccess(c, s))
  )

/**
 * The `maybe` parser combinator creates a parser which will run the provided
 * parser on the input, and if it fails, it will returns the empty string (as
 * a result, without consuming any input.
 */
export const maybe = (parser: Parser<string>): Parser<string> => parser.alt(empty)

/**
 * Matches the end of the input
 */
export const eof: Parser<undefined> = new Parser(s =>
  s === '' ? createParseSuccess(undefined, '') : createParseFailure(s, 'end of file')
)

/**
 * The `many` combinator takes a parser, and returns a new parser which will
 * run the parser repeatedly on the input stream until it fails, returning
 * a list of the result values of each parse operation as its result, or the
 * empty list if the parser never succeeded.
 *
 * Read that as "match this parser zero or more times and give me a list of
 * the results."
 */
export const many = <A>(parser: Parser<A>): Parser<Array<A>> => alt(many1(parser).map(a => a.toArray()), of([]))

/**
 * The `many1` combinator is just like the `many` combinator, except it
 * requires its wrapped parser to match at least once. The resulting list is
 * thus guaranteed to contain at least one value.
 */
export const many1 = <A>(parser: Parser<A>): Parser<NonEmptyArray<A>> =>
  parser.chain(head => many(parser).chain(tail => of(new NonEmptyArray(head, tail))))

/**
 * Matches the provided parser `p` zero or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 */
export const sepBy = <A, B>(sep: Parser<A>, parser: Parser<B>): Parser<Array<B>> =>
  alt(sepBy1(sep, parser).map(a => a.toArray()), of([]))

/** Matches both parsers and return the value of the second */
export const second = <A>(pa: Parser<A>) => <B>(pb: Parser<B>): Parser<B> =>
  new Parser(s => applySecondParser(pa, pb).run(s))

/**
 * Matches the provided parser `p` one or more times, but requires the
 * parser `sep` to match once in between each match of `p`. In other words,
 * use `sep` to match separator characters in between matches of `p`.
 */
export const sepBy1 = <A, B>(sep: Parser<A>, parser: Parser<B>): Parser<NonEmptyArray<B>> =>
  parser.chain(head => alt(many(second(sep)(parser)), of([])).chain(tail => of(new NonEmptyArray(head, tail))))

export const parser: Monad1<URI> & Alternative1<URI> & Monoid<Parser<string>> = {
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

export const fold: (ps: Array<Parser<string>>) => Parser<string> = foldMonoid(parser)

const applySecondParser = applySecond(parser)
