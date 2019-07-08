import { empty } from 'fp-ts/lib/Array'
import { Either, left, right } from 'fp-ts/lib/Either'
import { Stream } from './Stream'

/**
 * @since 0.6.0
 */
export interface ParseError<I> {
  input: Stream<I>
  expected: Array<string>
  fatal: boolean
}

/**
 * @since 0.6.0
 */
export interface ParseSuccess<I, A> {
  value: A
  next: Stream<I>
  start: Stream<I>
}

/**
 * @since 0.6.0
 */
export type ParseResult<I, A> = Either<ParseError<I>, ParseSuccess<I, A>>

/**
 * @since 0.6.0
 */
export function withExpected<I>(err: ParseError<I>, expected: Array<string>): ParseError<I> {
  return {
    ...err,
    expected
  }
}

/**
 * @since 0.6.0
 */
export function escalate<I>(err: ParseError<I>): ParseError<I> {
  return {
    ...err,
    fatal: true
  }
}

/**
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

/**
 * @since 0.6.0
 */
export function success<I, A>(value: A, next: Stream<I>, start: Stream<I>): ParseResult<I, A> {
  return right({
    value,
    next,
    start
  })
}

/**
 * @since 0.6.0
 */
export function error<I, A = never>(
  input: Stream<I>,
  expected: Array<string> = empty,
  fatal: boolean = false
): ParseResult<I, A> {
  return left({
    input,
    expected,
    fatal
  })
}
