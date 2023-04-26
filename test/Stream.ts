import * as assert from 'assert'
import { Eq } from 'fp-ts/lib/string'

import { stream as S } from '../src'

describe('Stream', () => {
  it('getEq', () => {
    const E = S.getEq(Eq)
    assert.strictEqual(E.equals(S.stream([]), S.stream([])), true)
    assert.strictEqual(E.equals(S.stream([]), S.stream(['a'])), false)
    assert.strictEqual(E.equals(S.stream(['a']), S.stream(['a'])), true)
    assert.strictEqual(E.equals(S.stream(['a']), S.stream(['a'], 1)), false)
  })
})
