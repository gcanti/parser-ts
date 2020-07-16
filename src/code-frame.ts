/**
 * @since 0.6.0
 */
import { bimap, Either } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { Char } from './char'
import { Parser } from './Parser'
import { stream } from './Stream'
const { codeFrameColumns } = require('@babel/code-frame')

interface Location {
  readonly start: {
    readonly line: number
    readonly column: number
  }
}

function getLocation(source: string, cursor: number): Location {
  let line = 1
  let column = 1
  let i = 0
  while (i < cursor) {
    i++
    const c = source.charAt(i)
    if (c === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return {
    start: {
      line,
      column
    }
  }
}

/**
 * Returns a pretty printed error message using `@babel/code-frame`
 *
 * @since 0.6.0
 */
export const run: <A>(p: Parser<Char, A>, source: string) => Either<string, A> = (p, source) =>
  pipe(
    p(stream(source.split(''))),
    bimap(
      err =>
        codeFrameColumns(source, getLocation(source, err.input.cursor), {
          message: 'Expected: ' + err.expected.join(', ')
        }),
      succ => succ.value
    )
  )
