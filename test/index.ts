import * as assert from 'assert'
import {
  unparser,
  remaining,
  createParseFailure,
  zero,
  sat,
  alt,
  fold,
  createParseSuccess
} from '../src'
import { char } from '../src/char'
import { eqEithers } from './helpers'

describe('Parser', () => {

  it('unparser', () => {
    const { consumed, remaining } = unparser(zero(), 's')
    assert.strictEqual(remaining, 's')
    eqEithers(consumed, createParseFailure('s', 'Parse failed on `fail`'))
  })

  it('sat', () => {
    const parser = sat(c => c === 'a')
    assert.strictEqual(remaining(parser.run('a')), '')
    assert.strictEqual(remaining(parser.run('b')), 'b')
  })

  it('alt', () => {
    const parser = alt(sat(c => c === 'a'), sat(c => c === 'b'))
    assert.strictEqual(remaining(parser.run('a')), '')
    assert.strictEqual(remaining(parser.run('b')), '')
    assert.strictEqual(remaining(parser.run('c')), 'c')
  })

  it('fold', () => {
    const parser = fold([char('a'), char('b')])
    eqEithers(parser.run('ab'), createParseSuccess('ab', ''))
  })

})
