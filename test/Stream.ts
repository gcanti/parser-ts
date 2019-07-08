import * as assert from 'assert'
import { stream as S } from '../src'
import { eqString } from 'fp-ts/lib/Eq'

describe('Stream', () => {
  it('getEq', () => {
    const E = S.getEq(eqString)
    assert.strictEqual(E.equals(S.stream([]), S.stream([])), true)
    assert.strictEqual(E.equals(S.stream([]), S.stream(['a'])), false)
    assert.strictEqual(E.equals(S.stream(['a']), S.stream(['a'])), true)
    assert.strictEqual(E.equals(S.stream(['a']), S.stream(['a'], 1)), false)
  })
})
