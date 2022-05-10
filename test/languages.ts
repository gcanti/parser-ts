import * as assert from 'assert'
import { parser as P, string as S } from '../src'
import { success, error } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { run } from '../src/string'
import { pipe } from 'fp-ts/lib/function'

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
      run('/users/1')(pathParser),
      success(
        { user: 1 },
        stream(['/', 'u', 's', 'e', 'r', 's', '/', '1'], 8),
        stream(['/', 'u', 's', 'e', 'r', 's', '/', '1'])
      )
    )
    assert.deepStrictEqual(
      run('/users/a')(pathParser),
      error(stream(['/', 'u', 's', 'e', 'r', 's', '/', 'a'], 7), ['an integer'])
    )
  })
})
