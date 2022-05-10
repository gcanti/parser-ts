/**
 * @since 0.6.0
 */
import { bimap, Either } from 'fp-ts/lib/Either'
import { Char } from './char'
import { Parser } from './Parser'
import { stream } from './Stream'
import { pipe } from 'fp-ts/lib/function'

const { codeFrameColumns } = require('@babel/code-frame')

interface Location {
  readonly start: {
    readonly line: number
    readonly column: number
  }
}

const lineTerminatorRegex = /^\r\n$|^[\n\r]$/

const getLocation: (source: string, cursor: number) => Location = (source, cursor) => {
  let line = 1
  let column = 1
  let i = 0
  while (i < cursor) {
    i++
    const c = source.charAt(i)
    if (lineTerminatorRegex.test(c)) {
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
