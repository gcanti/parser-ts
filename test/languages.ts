import * as assert from 'assert'
import { parser as P, string as S } from '../src'
import { success, error } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { pipe } from 'fp-ts/lib/pipeable'
import { run } from './helpers'

export const pathParser = pipe(
  S.string('/users/'),
  P.chain(() =>
    pipe(
      S.int,
      P.map(n => ({ user: n }))
    )
  )
)

describe('languages', () => {
  it('a parser for the path `/users/:user`', () => {
    assert.deepStrictEqual(
      run(pathParser, '/users/1'),
      success(
        { user: 1 },
        stream(['/', 'u', 's', 'e', 'r', 's', '/', '1'], 8),
        stream(['/', 'u', 's', 'e', 'r', 's', '/', '1'])
      )
    )
    assert.deepStrictEqual(
      run(pathParser, '/users/a'),
      error(stream(['/', 'u', 's', 'e', 'r', 's', '/', 'a'], 7), ['an integer'])
    )
  })
})
