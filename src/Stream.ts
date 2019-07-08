import { getEq as getArrayEq, lookup } from 'fp-ts/lib/Array'
import { Eq, fromEquals } from 'fp-ts/lib/Eq'
import { map, Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

/**
 * @since 0.6.0
 */
export interface Stream<A> {
  readonly buffer: Array<A>
  readonly cursor: number
}

/**
 * @since 0.6.0
 */
export function stream<A>(buffer: Array<A>, cursor: number = 0): Stream<A> {
  return { buffer, cursor }
}

/**
 * @since 0.6.0
 */
export function get<A>(s: Stream<A>): Option<A> {
  return lookup(s.cursor, s.buffer)
}

/**
 * @since 0.6.0
 */
export function atEnd<A>(s: Stream<A>): boolean {
  return s.cursor >= s.buffer.length
}

/**
 * @since 0.6.0
 */
export function getAndNext<A>(s: Stream<A>): Option<{ value: A; next: Stream<A> }> {
  return pipe(
    get(s),
    map(a => ({ value: a, next: { buffer: s.buffer, cursor: s.cursor + 1 } }))
  )
}

/**
 * @since 0.6.0
 */
export function getEq<A>(E: Eq<A>): Eq<Stream<A>> {
  const EA = getArrayEq(E)
  return fromEquals((x, y) => x.cursor === y.cursor && EA.equals(x.buffer, y.buffer))
}
