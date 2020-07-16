/**
 * @since 0.6.0
 */
import { getEq as getArrayEq, lookup } from 'fp-ts/lib/Array'
import { Eq, fromEquals } from 'fp-ts/lib/Eq'
import { map, Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.6.0
 */
export interface Stream<A> {
  readonly buffer: Array<A>
  readonly cursor: number
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.6.0
 */
export const stream: <A>(buffer: Array<A>, cursor: number) => Stream<A> = (buffer, cursor = 0) => ({
  buffer,
  cursor
})

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.6.0
 */
export const get: <A>(s: Stream<A>) => Option<A> = (s) => lookup(s.cursor, s.buffer)

/**
 * @category destructors
 * @since 0.6.0
 */
export const atEnd: <A>(s: Stream<A>) => boolean = (s) => s.cursor >= s.buffer.length

/**
 * @category destructors
 * @since 0.6.0
 */
export const getAndNext: <A>(s: Stream<A>) => Option<{ value: A; next: Stream<A> }> = (s) =>
  pipe(
    get(s),
    map(a => ({ value: a, next: { buffer: s.buffer, cursor: s.cursor + 1 } }))
  )

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.6.0
 */
export const getEq: <A>(E: Eq<A>) => Eq<Stream<A>> = (E) => {
  const EA = getArrayEq(E)
  return fromEquals((x, y) => x.cursor === y.cursor && EA.equals(x.buffer, y.buffer))
}
