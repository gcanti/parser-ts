/**
 * @since 0.6.0
 */
import { empty, getMonoid } from 'fp-ts/lib/Array'
import { Either, left, right } from 'fp-ts/lib/Either'
import { getFirstSemigroup, getLastSemigroup, getStructSemigroup, Semigroup } from 'fp-ts/lib/Semigroup'
import { Stream } from './Stream'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

// TODO: make readonly in version 0.7.0
/**
 * @category model
 * @since 0.6.0
 */
export interface ParseError<I> {
  input: Stream<I>
  expected: Array<string>
  fatal: boolean
}

// TODO: make readonly in version 0.7.0
/**
 * @category model
 * @since 0.6.0
 */
export interface ParseSuccess<I, A> {
  value: A
  next: Stream<I>
  start: Stream<I>
}

/**
 * @category model
 * @since 0.6.0
 */
export type ParseResult<I, A> = Either<ParseError<I>, ParseSuccess<I, A>>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.6.0
 */
export const success: <I, A>(value: A, next: Stream<I>, start: Stream<I>) => ParseResult<I, A> = (value, next, start) =>
  right({
    value,
    next,
    start
  })

/**
 * @category constructors
 * @since 0.6.0
 */
export const error: <I, A = never>(input: Stream<I>, expected?: Array<string>, fatal?: boolean) => ParseResult<I, A> = (
  input,
  expected = empty,
  fatal = false
) =>
  left({
    input,
    expected,
    fatal
  })

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 0.6.0
 */
export const withExpected: <I>(err: ParseError<I>, expected: Array<string>) => ParseError<I> = (err, expected) => ({
  ...err,
  expected
})

/**
 * @category combinators
 * @since 0.6.0
 */
export const escalate: <I>(err: ParseError<I>) => ParseError<I> = err => ({
  ...err,
  fatal: true
})

/**
 * @category combinators
 * @since 0.6.0
 */
export const extend = <I>(err1: ParseError<I>, err2: ParseError<I>): ParseError<I> =>
  getSemigroup<I>().concat(err1, err2)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

const getSemigroup = <I>(): Semigroup<ParseError<I>> => ({
  concat: (x, y) => {
    if (x.input.cursor < y.input.cursor) return getLastSemigroup<ParseError<I>>().concat(x, y)
    if (x.input.cursor > y.input.cursor) return getFirstSemigroup<ParseError<I>>().concat(x, y)

    return getStructSemigroup<ParseError<I>>({
      input: getFirstSemigroup<Stream<I>>(),
      fatal: getFirstSemigroup<boolean>(),
      expected: getMonoid<string>()
    }).concat(x, y)
  }
})
