import * as assert from 'assert'
import * as E from 'fp-ts/lib/Either'

import { run } from '../src/code-frame'
import { pathParser } from './languages'

describe('code-frame', () => {
  it('run', () => {
    assert.deepStrictEqual(run(pathParser, '/users/1'), E.right({ user: 1 }))
    assert.deepStrictEqual(
      run(pathParser, '/users/a'),
      E.left(`> 1 | /users/a
    |        ^ Expected: an integer`)
    )
    assert.deepStrictEqual(
      run(pathParser, '/users/\na'),
      E.left(`  1 | /users/
> 2 | a
    | ^ Expected: an integer`)
    )
  })
})
