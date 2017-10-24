import { HKT } from 'fp-ts/lib/HKT'
import { Option, none, some } from 'fp-ts/lib/Option'
import { Foldable } from 'fp-ts/lib/Foldable'
import * as array from 'fp-ts/lib/Array'
import { Parser } from '.'
import * as p from '.'
import * as c from './char'

/** Matches the given parser zero or more times, returning a string of the
 * entire match
 */
export function many(parser: Parser<string>): Parser<string> {
  return p.maybe(many1(parser))
}

/** Matches the given parser one or more times, returning a string of the
 * entire match
 */
export function many1(parser: Parser<string>): Parser<string> {
  return p.many1(parser).map(nea => nea.toArray().join(''))
}

export function getAndNext(s: string, prefix: string): Option<[string, string]> {
  const i = s.indexOf(prefix)
  if (i === 0) {
    return some<[string, string]>([prefix, s.substring(prefix.length)])
  }
  return none
}

/** Matches the exact string provided. */
export function string(prefix: string): Parser<string> {
  return new Parser(s =>
    getAndNext(s, prefix).fold(
      () => p.createParseFailure<string>(s, JSON.stringify(prefix)),
      ([c, s]) => p.createParseSuccess(c, s)
    )
  )
}

export function oneOfF<F>(foldable: Foldable<F>): (fs: HKT<F, string>) => Parser<string> {
  return fs => foldable.reduce((p, s: string) => p.alt(string(s)), p.zero<string>(), fs)
}

/** Matches one of a list of strings. */
export function oneOf(ss: Array<string>): Parser<string> {
  return p.expected(oneOfF(array)(ss), `one of ${JSON.stringify(ss)}`)
}

/** Matches zero or more whitespace characters. */
export const spaces = c.many(c.space)

/** Matches one or more whitespace characters. */
export const spaces1 = c.many1(c.space)

/** Matches zero or more non-whitespace characters. */
export const notSpaces = c.many(c.notSpace)

/** Matches one or more non-whitespace characters. */
export const notSpaces1 = c.many1(c.notSpace)

function fromString(s: string): Option<number> {
  const n = parseFloat(s)
  return isNaN(n) ? none : some(n)
}

const intParsers = [p.maybe(c.char('-')), c.many1(c.digit)]

export const int = p.expected(
  p.fold(intParsers).chain<number>(s => fromString(s).fold(() => p.fail, n => p.of(n))),
  'an integer'
)

const floatParsers = [p.maybe(c.char('-')), c.many(c.digit), p.maybe(p.fold([c.char('.'), c.many1(c.digit)]))]

export const float = p.expected(
  p.fold(floatParsers).chain<number>(s => fromString(s).fold(() => p.fail, n => p.of(n))),
  'an integer'
)

export const doubleQuote = c.char('"')

/** Parses a double quoted string, with support for escaping double quotes
 * inside it, and returns the inner string. Does not perform any other form
 * of string escaping.
 */
export const doubleQuotedString = doubleQuote
  .chain(() => many(p.either(string('\\"'), c.notChar('"'))))
  .chain(s => doubleQuote.chain(() => p.of(s)))
