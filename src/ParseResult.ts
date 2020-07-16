/**
 * @since 0.6.0
 */
import { empty } from 'fp-ts/lib/Array'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Stream } from './Stream'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.7.0
 */
export interface ParseError<I> {
  readonly input: Stream<I>
  readonly expected: Array<string>
  readonly fatal: boolean
}

/**
 * @category model
 * @since 0.7.0
 */
export interface ParseSuccess<I, A> {
  readonly value: A
  readonly next: Stream<I>
  readonly start: Stream<I>
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
export function extend<I>(err1: ParseError<I>, err2: ParseError<I>): ParseError<I> {
  if (err1.input.cursor < err2.input.cursor) {
    return err2
  } else if (err1.input.cursor > err2.input.cursor) {
    return err1
  } else {
    return {
      ...err1,
      expected: err1.expected.concat(err2.expected)
    }
  }
}
