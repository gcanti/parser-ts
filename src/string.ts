/**
 * @since 0.6.0
 */
import { Foldable, Foldable1 } from 'fp-ts/lib/Foldable'
import { Functor, Functor1 } from 'fp-ts/lib/Functor'
import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as M from 'fp-ts/lib/Monoid'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as C from './char'
import * as P from './Parser'

/**
 * @since 0.6.0
 */
export const maybe: <I>(p: P.Parser<I, string>) => P.Parser<I, string> = P.maybe(M.monoidString)

/**
 * Matches the given parser zero or more times, returning a string of the
 * entire match
 *
 * @since 0.6.0
 */
export function many(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> {
  return maybe(many1(parser))
}

/**
 * Matches the given parser one or more times, returning a string of the
 * entire match
 *
 * @since 0.6.0
 */
export function many1(parser: P.Parser<C.Char, string>): P.Parser<C.Char, string> {
  return pipe(
    P.many1(parser),
    P.map(nea => nea.join(''))
  )
}

function charAt(index: number, s: string): O.Option<C.Char> {
  return index >= 0 && index < s.length ? O.some(s.charAt(index)) : O.none
}

/**
 * Matches the exact string provided.
 *
 * @since 0.6.0
 */
export function string(s: string): P.Parser<C.Char, string> {
  function _string(s2: string): P.Parser<C.Char, string> {
    return pipe(
      charAt(0, s2),
      O.fold(
        () => P.succeed(''),
        c =>
          pipe(
            C.char(c),
            P.chain(() => _string(s2.slice(1))),
            P.chain(() => P.succeed(s))
          )
      )
    )
  }
  return P.expected(_string(s), JSON.stringify(s))
}

/**
 * Matches one of a list of strings.
 *
 * @since 0.6.0
 */
export function oneOf<F extends URIS>(F: Functor1<F> & Foldable1<F>): (ss: Kind<F, string>) => P.Parser<C.Char, string>
export function oneOf<F>(F: Functor<F> & Foldable<F>): (ss: HKT<F, string>) => P.Parser<C.Char, string>
export function oneOf<F>(F: Functor<F> & Foldable<F>): (ss: HKT<F, string>) => P.Parser<C.Char, string> {
  return ss =>
    F.reduce(ss, P.fail(), (p, s) =>
      pipe(
        p,
        P.alt(() => string(s))
      )
    )
}

/**
 * Matches zero or more whitespace characters.
 *
 * @since 0.6.0
 */
export const spaces: P.Parser<C.Char, string> = C.many(C.space)

/**
 * Matches one or more whitespace characters.
 *
 * @since 0.6.0
 */
export const spaces1: P.Parser<C.Char, string> = C.many1(C.space)

/**
 * Matches zero or more non-whitespace characters.
 *
 * @since 0.6.0
 */
export const notSpaces: P.Parser<C.Char, string> = C.many(C.notSpace)

/**
 * Matches one or more non-whitespace characters.
 *
 * @since 0.6.0
 */
export const notSpaces1: P.Parser<C.Char, string> = C.many1(C.notSpace)

/**
 * @since 0.6.0
 */
export const fold: <I>(as: Array<P.Parser<I, string>>) => P.Parser<I, string> = M.fold(P.getMonoid(M.monoidString))

function fromString(s: string): O.Option<number> {
  const n = +s
  return isNaN(n) || s === '' ? O.none : O.some(n)
}

/**
 * @since 0.6.0
 */
export const int: P.Parser<C.Char, number> = P.expected(
  pipe(
    fold([maybe(C.char('-')), C.many1(C.digit)]),
    P.map(s => +s)
  ),
  'an integer'
)

/**
 * @since 0.6.0
 */
export const float: P.Parser<C.Char, number> = P.expected(
  pipe(
    fold([maybe(C.char('-')), C.many(C.digit), maybe(fold([C.char('.'), C.many1(C.digit)]))]),
    P.chain(s =>
      pipe(
        fromString(s),
        O.fold(() => P.fail(), P.succeed)
      )
    )
  ),
  'a float'
)

/**
 * Parses a double quoted string, with support for escaping double quotes
 * inside it, and returns the inner string. Does not perform any other form
 * of string escaping.
 *
 * @since 0.6.0
 */
export const doubleQuotedString = P.surroundedBy(C.char('"'))(many(P.either(string('\\"'), () => C.notChar('"'))))
