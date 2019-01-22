import { none, Option, some } from 'fp-ts/lib/Option'
import * as P from '.'
import * as C from './char'

/**
 * Matches the given parser zero or more times, returning a string of the
 * entire match
 */
export function many(parser: P.Parser<string>): P.Parser<string> {
  return P.maybe(many1(parser))
}

/**
 * Matches the given parser one or more times, returning a string of the
 * entire match
 */
export function many1(parser: P.Parser<string>): P.Parser<string> {
  return P.many1(parser).map(nea => nea.toArray().join(''))
}

export function getAndNext(s: string, prefix: string): Option<[string, string]> {
  const i = s.indexOf(prefix)
  if (i === 0) {
    return some<[string, string]>([prefix, s.substring(prefix.length)])
  }
  return none
}

/** Matches the exact string provided. */
export function string(prefix: string): P.Parser<string> {
  return new P.Parser(s =>
    getAndNext(s, prefix).foldL(
      () => P.createParseFailure(s, JSON.stringify(prefix)),
      ([c, s]) => P.createParseSuccess(c, s)
    )
  )
}

/** Matches one of a list of strings. */
export function oneOf(ss: Array<string>): P.Parser<string> {
  return P.expected(P.alts(...ss.map(string)), `one of ${JSON.stringify(ss)}`)
}

/** Matches zero or more whitespace characters. */
export const spaces = C.many(C.space)

/** Matches one or more whitespace characters. */
export const spaces1 = C.many1(C.space)

/** Matches zero or more non-whitespace characters. */
export const notSpaces = C.many(C.notSpace)

/** Matches one or more non-whitespace characters. */
export const notSpaces1 = C.many1(C.notSpace)

function fromString(s: string): Option<number> {
  const n = parseFloat(s)
  return isNaN(n) ? none : some(n)
}

const intParsers = [P.maybe(C.char('-')), C.many1(C.digit)]

export const int = P.expected(P.fold(intParsers).chain(s => fromString(s).fold(P.fail, P.succeed)), 'an integer')

const floatParsers = [P.maybe(C.char('-')), C.many(C.digit), P.maybe(P.fold([C.char('.'), C.many1(C.digit)]))]

export const float = P.expected(P.fold(floatParsers).chain(s => fromString(s).fold(P.fail, P.succeed)), 'a float')

export const doubleQuote = C.char('"')

/**
 * Parses a double quoted string, with support for escaping double quotes
 * inside it, and returns the inner string. Does not perform any other form
 * of string escaping.
 */
export const doubleQuotedString = doubleQuote
  .chain(() => many(P.either(string('\\"'), C.notChar('"'))))
  .chain(s => doubleQuote.chain(() => P.succeed(s)))
