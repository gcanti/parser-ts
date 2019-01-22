import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as assert from 'assert'
import * as P from '../src'
import * as C from '../src/char'
import { eqEithers } from './helpers'
import { right } from 'fp-ts/lib/Either'

describe('Parser', () => {
  it('unparser', () => {
    const { consumed: c1, remaining: r1 } = P.unparser(P.parser.zero())('a')
    assert.strictEqual(r1, 'a')
    eqEithers(c1, P.createParseFailure('a', 'Parse failed on `fail`'))
    const { consumed: c2, remaining: r2 } = P.unparser(C.char('a'))('a')
    assert.strictEqual(r2, '')
    assert.deepEqual(c2, right('a'))
  })

  it('sat', () => {
    const parser = P.sat(c => c === 'a')
    assert.strictEqual(P.remaining(parser.run('a')), '')
    assert.strictEqual(P.remaining(parser.run('b')), 'b')
  })

  it('alt', () => {
    const parser = P.parser.alt(P.sat(c => c === 'a'), P.sat(c => c === 'b'))
    assert.strictEqual(P.remaining(parser.run('a')), '')
    assert.strictEqual(P.remaining(parser.run('b')), '')
    assert.strictEqual(P.remaining(parser.run('c')), 'c')
  })

  it('alts', () => {
    const parser = P.alts(P.sat(c => c === 'a'), P.sat(c => c === 'b'), P.sat(c => c === 'c'))
    assert.strictEqual(P.remaining(parser.run('a')), '')
    assert.strictEqual(P.remaining(parser.run('b')), '')
    assert.strictEqual(P.remaining(parser.run('c')), '')
    assert.strictEqual(P.remaining(parser.run('d')), 'd')
  })

  it('fold', () => {
    const parser = P.fold([C.char('a'), C.char('b')])
    eqEithers(parser.run('ab'), P.createParseSuccess('ab', ''))
  })

  it('many', () => {
    const parser = P.many(C.char('a'))
    eqEithers(parser.run('aa'), P.createParseSuccess(['a', 'a'], ''))
  })

  it('sepBy1', () => {
    const parser = P.sepBy1(C.char(','), P.sat(c => c !== ','))
    eqEithers(parser.run('a,b,c'), P.createParseSuccess(new NonEmptyArray('a', ['b', 'c']), ''))
  })

  it('seqBy', () => {
    const parser = P.sepBy(C.char(','), P.sat(c => c !== ','))
    eqEithers(parser.run('a,b,c'), P.createParseSuccess(['a', 'b', 'c'], ''))
    eqEithers(parser.run('a'), P.createParseSuccess(['a'], ''))
    eqEithers(parser.run(''), P.createParseSuccess([], ''))
  })

  it('eof', () => {
    const parser = P.eof
    eqEithers(parser.run('aa'), P.createParseFailure('aa', 'end of file'))
    eqEithers(parser.run(''), P.createParseSuccess(undefined, ''))
  })

  it('chain', () => {
    const parser = P.parser.chain(C.char('a'), () => C.char('b'))
    eqEithers(parser.run('ab'), P.createParseSuccess('b', ''))
  })

  it('item', () => {
    const parser = P.item
    eqEithers(parser.run('ab'), P.createParseSuccess('a', 'b'))
    eqEithers(parser.run(''), P.createParseFailure('', 'Parse failed on item'))
  })

  it('ap_', () => {
    const parser = P.parser
      .of((a: string) => (b: string) => a + b + a + b)
      .ap_(C.char('a'))
      .ap_(C.char('b'))
    eqEithers(parser.run('ab'), P.createParseSuccess('abab', ''))
  })

  it('applyFirst', () => {
    const parser = C.char('a').applyFirst(C.char('b'))
    eqEithers(parser.run('ab'), P.createParseSuccess('a', ''))
  })

  it('applySecond', () => {
    const parser = C.char('a').applySecond(C.char('b'))
    eqEithers(parser.run('ab'), P.createParseSuccess('b', ''))
  })

  it('expectedL', () => {
    const parser = P.expectedL(C.char('a'), remaining => `Expected "a", got ${JSON.stringify(remaining)}`)
    eqEithers(parser.run('bc'), P.createParseFailure('bc', 'Expected "a", got "bc"'))
  })
})
