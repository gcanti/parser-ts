/**
 * @since 0.6.0
 */
import * as E from 'fp-ts/lib/Either'
import { Foldable, Foldable1 } from 'fp-ts/lib/Foldable'
import { Functor, Functor1 } from 'fp-ts/lib/Functor'
import { HKT, Kind, URIS } from 'fp-ts/lib/HKT'
import * as M from 'fp-ts/lib/Monoid'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as C from './char'
import * as P from './Parser'
import { success } from './ParseResult'

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Matches the exact string provided.
 *
 * @category constructors
 * @since 0.6.0
 */
export const string: (s: string) => P.Parser<C.Char, string> = s => {
  const _string: (s2: string) => P.Parser<C.Char, string> = s2 =>
    pipe(
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
  return P.expected(_string(s), JSON.stringify(s))
}

/**
 * Fails if the specified string is matched, otherwise succeeds with an empty result and
 * consumes no input.
 *
 * @example
 * import { run } from 'parser-ts/lib/code-frame'
 * import * as S from 'parser-ts/lib/string'
 *
 * const parser = S.notString('foo')
 *
 * run(parser, 'bar')
 * // { _tag: 'Right', right: '' }
 *
 * run(parser, 'foo')
 * // { _tag: 'Left', left: '> 1 | foo\n    | ^ Expected: not "foo"' }
 *
 * @category constructors
 * @since 0.7.0
 */
export const notString: (s: string) => P.Parser<C.Char, string> = s => i => {
  const _string: (s2: string) => P.Parser<C.Char, string> = s2 =>
    pipe(
      charAt(0, s2),
      O.fold(
        () => P.succeed(''),
        c =>
          pipe(
            C.notChar(c),
            P.chain(() => _string(s2.slice(1))),
            P.chain(() => P.succeed(''))
          )
      )
    )
  return pipe(
    P.expected(_string(s), `not ${JSON.stringify(s)}`)(i),
    E.chain(next => success(next.value, i, i))
  )
}

/**
 * Matches one of a list of strings.
 *
 * @category constructors
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

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.6.0
 */
export const fold: <I>(as: Array<P.Parser<I, string>>) => P.Parser<I, string> = M.fold(P.getMonoid(M.monoidString))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 0.6.0
 */
export const maybe: <I>(p: P.Parser<I, string>) => P.Parser<I, string> = P.maybe(M.monoidString)

/**
 * Matches the given parser zero or more times, returning a string of the
 * entire match
 *
 * @category combinators
 * @since 0.6.0
 */
export const many: (parser: P.Parser<C.Char, string>) => P.Parser<C.Char, string> = parser => maybe(many1(parser))

/**
 * Matches the given parser one or more times, returning a string of the
 * entire match
 *
 * @category combinators
 * @since 0.6.0
 */
export const many1: (parser: P.Parser<C.Char, string>) => P.Parser<C.Char, string> = parser =>
  pipe(
    P.many1(parser),
    P.map(nea => nea.join(''))
  )

const charAt: (index: number, s: string) => O.Option<C.Char> = (index, s) =>
  index >= 0 && index < s.length ? O.some(s.charAt(index)) : O.none

/**
 * Matches zero or more whitespace characters.
 *
 * @category combinators
 * @since 0.6.0
 */
export const spaces: P.Parser<C.Char, string> = C.many(C.space)

/**
 * Matches one or more whitespace characters.
 *
 * @category combinators
 * @since 0.6.0
 */
export const spaces1: P.Parser<C.Char, string> = C.many1(C.space)

/**
 * Matches zero or more non-whitespace characters.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notSpaces: P.Parser<C.Char, string> = C.many(C.notSpace)

/**
 * Matches one or more non-whitespace characters.
 *
 * @category combinators
 * @since 0.6.0
 */
export const notSpaces1: P.Parser<C.Char, string> = C.many1(C.notSpace)

const fromString: (s: string) => O.Option<number> = s => {
  const n = +s
  return isNaN(n) || s === '' ? O.none : O.some(n)
}

/**
 * @category combinators
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
 * @category combinators
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
 * @category combinators
 * @since 0.6.0
 */
export const doubleQuotedString: P.Parser<string, String> = P.surroundedBy(C.char('"'))(
  many(P.either(string('\\"'), () => C.notChar('"')))
)
