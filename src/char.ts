/**
 * @since 0.6.0
 */
import { not } from 'fp-ts/lib/function'
import { monoidString } from 'fp-ts/lib/Monoid'
import { pipe } from 'fp-ts/lib/pipeable'
import * as P from './Parser'

const maybe = P.maybe(monoidString)

/**
 * @since 0.6.0
 */
export type Char = string

/**
 * Takes a `Parser<Char, string>` and matches it zero or more times, returning
 * a `string` of what was matched.
 *
 * @since 0.6.0
 */
export function many(parser: P.Parser<Char, Char>): P.Parser<Char, string> {
  return maybe(many1(parser))
}

/**
 * Takes a `Parser<Char, string>` and matches it one or more times, returning
 * a `string` of what was matched.
 *
 * @since 0.6.0
 */
export function many1(parser: P.Parser<Char, Char>): P.Parser<Char, string> {
  return pipe(
    P.many1(parser),
    P.map(nea => nea.join(''))
  )
}

/**
 * The `char` parser constructor returns a parser which matches only the
 * specified single character
 *
 * @since 0.6.0
 */
export function char(c: Char): P.Parser<Char, Char> {
  return P.expected(
    P.sat(s => s === c),
    `"${c}"`
  )
}

/**
 * The `notChar` parser constructor makes a parser which will match any
 * single character other than the one provided.
 *
 * @since 0.6.0
 */
export function notChar(c: Char): P.Parser<Char, Char> {
  return P.expected(
    P.sat(c1 => c1 !== c),
    `anything but "${c}"`
  )
}

function isOneOf(s: string, c: Char): boolean {
  return s.indexOf(c) !== -1
}

/**
 * Matches any one character from the provided string.
 *
 * @since 0.6.0
 */
export function oneOf(s: string): P.Parser<Char, Char> {
  return P.expected(
    P.sat(c => isOneOf(s, c)),
    `One of "${s}"`
  )
}

function isDigit(c: Char): boolean {
  return '0123456789'.indexOf(c) !== -1
}

/**
 * Matches a single digit.
 *
 * @since 0.6.0
 */
export const digit: P.Parser<Char, Char> = P.expected(P.sat(isDigit), 'a digit')

const spaceRe = /^\s$/

function isSpace(c: Char): boolean {
  return spaceRe.test(c)
}

/**
 * Matches a single whitespace character.
 *
 * @since 0.6.0
 */
export const space: P.Parser<Char, Char> = P.expected(P.sat(isSpace), 'a whitespace')

function isUnderscore(c: Char): boolean {
  return c === '_'
}

function isLetter(c: Char): boolean {
  return /[a-z]/.test(c.toLowerCase())
}

function isAlphanum(c: Char): boolean {
  return isLetter(c) || isDigit(c) || isUnderscore(c)
}

/**
 * Matches a single letter, digit or underscore character.
 *
 * @since 0.6.0
 */
export const alphanum: P.Parser<Char, Char> = P.expected(P.sat(isAlphanum), 'a word character')

/**
 * Matches a single ASCII letter.
 *
 * @since 0.6.0
 */
export const letter = P.expected(P.sat(isLetter), 'a letter')

function isUpper(c: Char): boolean {
  return isLetter(c) && c === c.toUpperCase()
}

/**
 * Matches a single upper case ASCII letter.
 *
 * @since 0.6.0
 */
export const upper: P.Parser<Char, Char> = P.expected(P.sat(isUpper), 'an upper case letter')

function isLower(c: Char): boolean {
  return isLetter(c) && c === c.toLowerCase()
}

/**
 * Matches a single lower case ASCII letter.
 *
 * @since 0.6.0
 */
export const lower: P.Parser<Char, Char> = P.expected(P.sat(isLower), 'a lower case letter')

/**
 * Matches a single character which isn't a character from the provided string.
 *
 * @since 0.6.0
 */
export function notOneOf(s: string): P.Parser<Char, Char> {
  return P.expected(
    P.sat(c => !isOneOf(s, c)),
    `Not one of ${JSON.stringify(s)}`
  )
}

/**
 * Matches a single character which isn't a digit.
 *
 * @since 0.6.0
 */
export const notDigit: P.Parser<Char, Char> = P.expected(P.sat(not(isDigit)), 'a non-digit')

/**
 * Matches a single character which isn't whitespace.
 *
 * @since 0.6.0
 */
export const notSpace: P.Parser<Char, Char> = P.expected(P.sat(not(isSpace)), 'a non-whitespace character')

/**
 * Matches a single character which isn't a letter, digit or underscore.
 *
 * @since 0.6.0
 */
export const notAlphanum: P.Parser<Char, Char> = P.expected(P.sat(not(isAlphanum)), 'a non-word character')

/**
 * Matches a single character which isn't an ASCII letter.
 *
 * @since 0.6.0
 */
export const notLetter: P.Parser<Char, Char> = P.expected(P.sat(not(isLetter)), 'a non-letter character')

/**
 * Matches a single character which isn't an upper case ASCII letter.
 *
 * @since 0.6.0
 */
export const notUpper: P.Parser<Char, Char> = P.expected(P.sat(not(isUpper)), 'anything but an upper case letter')

/**
 * Matches a single character which isn't a lower case ASCII letter.
 *
 * @since 0.6.0
 */
export const notLower: P.Parser<Char, Char> = P.expected(P.sat(not(isLower)), 'anything but a lower case letter')
