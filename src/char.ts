/**
 * @since 0.6.0
 */
import { not } from 'fp-ts/lib/function'
import { monoidString } from 'fp-ts/lib/Monoid'
import { pipe } from 'fp-ts/lib/pipeable'
import * as P from './Parser'

const maybe = P.maybe(monoidString)

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.6.0
 */
export type Char = string

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * The `char` parser constructor returns a parser which matches only the
 * specified single character
 *
 * @category constructors
 * @since 0.6.0
 */
export const char: (c: Char) => P.Parser<Char, Char> = c =>
  P.expected(
    P.sat(s => s === c),
    `"${c}"`
  )

/**
 * The `notChar` parser constructor makes a parser which will match any
 * single character other than the one provided.
 *
 * @category constructors
 * @since 0.6.0
 */
export const notChar: (c: Char) => P.Parser<Char, Char> = c =>
  P.expected(
    P.sat(c1 => c1 !== c),
    `anything but "${c}"`
  )

const isOneOf: (s: string, c: Char) => boolean = (s, c) => s.indexOf(c) !== -1

/**
 * Matches any one character from the provided string.
 *
 * @category constructors
 * @since 0.6.0
 */
export const oneOf: (s: string) => P.Parser<Char, Char> = s =>
  P.expected(
    P.sat(c => isOneOf(s, c)),
    `One of "${s}"`
  )

/**
 * Matches a single character which isn't a character from the provided string.
 *
 * @category constructors
 * @since 0.6.0
 */
export const notOneOf: (s: string) => P.Parser<Char, Char> = s =>
  P.expected(
    P.sat(c => !isOneOf(s, c)),
    `Not one of ${JSON.stringify(s)}`
  )

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Takes a `Parser<Char, string>` and matches it zero or more times, returning
 * a `string` of what was matched.
 *
 * @category combinators
 * @since 0.6.0
 */
export const many: (parser: P.Parser<Char, Char>) => P.Parser<Char, string> = parser => maybe(many1(parser))

/**
 * Takes a `Parser<Char, string>` and matches it one or more times, returning
 * a `string` of what was matched.
 *
 * @category combinators
 * @since 0.6.0
 */
export const many1: (parser: P.Parser<Char, Char>) => P.Parser<Char, string> = parser =>
  pipe(
    P.many1(parser),
    P.map(nea => nea.join(''))
  )

const isDigit: (c: Char) => boolean = c => '0123456789'.indexOf(c) !== -1

/**
 * Matches a single digit.
 *
 * @category combinators
 * @since 0.6.0
 */
export const digit: P.Parser<Char, Char> = P.expected(P.sat(isDigit), 'a digit')

const spaceRe = /^\s$/

const isSpace: (c: Char) => boolean = c => spaceRe.test(c)

/**
 * Matches a single whitespace character.
 *
 * @category combinators
 * @since 0.6.0
 */
export const space: P.Parser<Char, Char> = P.expected(P.sat(isSpace), 'a whitespace')

const isUnderscore: (c: Char) => boolean = c => c === '_'

const isLetter: (c: Char) => boolean = c => /[a-z]/.test(c.toLowerCase())

const isAlphanum: (c: Char) => boolean = c => isLetter(c) || isDigit(c) || isUnderscore(c)

/**
 * Matches a single letter, digit or underscore character.
 *
 * @category combinators
 * @since 0.6.0
 */
export const alphanum: P.Parser<Char, Char> = P.expected(P.sat(isAlphanum), 'a word character')

/**
 * Matches a single ASCII letter.
 *
 * @since 0.6.0
 */
export const letter = P.expected(P.sat(isLetter), 'a letter')

const isUnicodeLetter: (c: Char) => boolean = c => c.toLowerCase() !== c.toUpperCase()

/**
 * Matches a single Unicode letter.
 * Works for scripts which have a notion of an upper case and lower case letters
 * (Latin-based scripts, Greek, Russian etc).
 *
 * @category combinators
 */
export const unicodeLetter = P.expected(P.sat(isUnicodeLetter), 'an unicode letter')

const isUpper: (c: Char) => boolean = c => isLetter(c) && c === c.toUpperCase()

/**
 * Matches a single upper case ASCII letter.
 *
 * @category combinators
 * @since 0.6.0
 */
export const upper: P.Parser<Char, Char> = P.expected(P.sat(isUpper), 'an upper case letter')

const isLower: (c: Char) => boolean = c => isLetter(c) && c === c.toLowerCase()

/**
 * Matches a single lower case ASCII letter.
 *
 * @category combinators
 * @since 0.6.0
 */
export const lower: P.Parser<Char, Char> = P.expected(P.sat(isLower), 'a lower case letter')

/**
 * Matches a single character which isn't a digit.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notDigit: P.Parser<Char, Char> = P.expected(P.sat(not(isDigit)), 'a non-digit')

/**
 * Matches a single character which isn't whitespace.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notSpace: P.Parser<Char, Char> = P.expected(P.sat(not(isSpace)), 'a non-whitespace character')

/**
 * Matches a single character which isn't a letter, digit or underscore.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notAlphanum: P.Parser<Char, Char> = P.expected(P.sat(not(isAlphanum)), 'a non-word character')

/**
 * Matches a single character which isn't an ASCII letter.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notLetter: P.Parser<Char, Char> = P.expected(P.sat(not(isLetter)), 'a non-letter character')

/**
 * Matches a single character which isn't an upper case ASCII letter.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notUpper: P.Parser<Char, Char> = P.expected(P.sat(not(isUpper)), 'anything but an upper case letter')

/**
 * Matches a single character which isn't a lower case ASCII letter.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notLower: P.Parser<Char, Char> = P.expected(P.sat(not(isLower)), 'anything but a lower case letter')
