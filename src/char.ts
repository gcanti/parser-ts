import { not } from 'fp-ts/lib/function'
import * as P from '.'

export type Char = string

/**
 * The `char` parser constructor returns a parser which matches only the
 * specified single character
 */
export function char(c: Char): P.Parser<Char> {
  return P.expected(P.sat(s => s === c), `"${c}"`)
}

/**
 * Takes a `P.Parser<string>` and matches it zero or more times, returning
 * a `String` of what was matched.
 */
export function many(parser: P.Parser<Char>): P.Parser<string> {
  return P.maybe(many1(parser))
}

/**
 * Takes a `P.Parser<string>` and matches it one or more times, returning
 * a `String` of what was matched.
 */
export function many1(parser: P.Parser<Char>): P.Parser<string> {
  return P.many1(parser).map(nea => nea.toArray().join(''))
}

/**
 * The `notChar` parser constructor makes a parser which will match any
 * single character other than the one provided.
 */
export function notChar(c: Char): P.Parser<Char> {
  return P.expected(P.sat(c1 => c1 !== c), `anything but "${c}"`)
}

function isOneOf(s: string, c: Char): boolean {
  return s.indexOf(c) !== -1
}

/** Matches any one character from the provided string. */
export function oneOf(s: string): P.Parser<Char> {
  return P.expected(P.sat(c => isOneOf(s, c)), `One of "${s}"`)
}

function isDigit(c: Char): boolean {
  return '0123456789'.indexOf(c) !== -1
}

/** Matches a single digit. */
export const digit = P.expected(P.sat(isDigit), 'a digit')

const spaceRe = /^\s$/

function isSpace(c: Char): boolean {
  return spaceRe.test(c)
}

/** Matches a single whitespace character. */
export const space = P.expected(P.sat(isSpace), 'whitespace')

function isUnderscore(c: Char): boolean {
  return c === '_'
}

function isLetter(c: Char): boolean {
  return /[a-z]/.test(c.toLowerCase())
}

function isAlphanum(c: Char): boolean {
  return isLetter(c) || isDigit(c) || isUnderscore(c)
}

/** Matches a single letter, digit or underscore character. */
export const alphanum = P.expected(P.sat(isAlphanum), 'a word character')

/** Matches a single ASCII letter. */
export const letter = P.expected(P.sat(isLetter), 'a letter')

function isUpper(c: Char): boolean {
  return isLetter(c) && c === c.toUpperCase()
}

/** Matches a single upper case ASCII letter. */
export const upper = P.expected(P.sat(isUpper), 'an upper case letter')

function isLower(c: Char): boolean {
  return isLetter(c) && c === c.toLowerCase()
}

/** Matches a single lower case ASCII letter. */
export const lower = P.expected(P.sat(isLower), 'a lower case letter')

/** Matches a single character which isn't a character from the provided string. */
export function notOneOf(s: string): P.Parser<Char> {
  return P.expected(P.sat(c => !isOneOf(s, c)), `Not one of ${JSON.stringify(s)}`)
}

/** Matches a single character which isn't a digit. */
export const notDigit = P.expected(P.sat(not(isDigit)), 'a non-digit')

/** Matches a single character which isn't whitespace. */
export const notSpace = P.expected(P.sat(not(isSpace)), 'a non-whitespace character')

/** Matches a single character which isn't a letter, digit or underscore. */
export const notAlphanum = P.expected(P.sat(not(isAlphanum)), 'a non-word character')

/** Matches a single character which isn't an ASCII letter. */
export const notLetter = P.expected(P.sat(not(isLetter)), 'a non-letter character')

/** Matches a single character which isn't an upper case ASCII letter. */
export const notUpper = P.expected(P.sat(not(isUpper)), 'anything but an upper case letter')

/** Matches a single character which isn't a lower case ASCII letter. */
export const notLower = P.expected(P.sat(not(isLower)), 'anything but a lower case letter')
