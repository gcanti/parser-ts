import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as assert from 'assert'
import {
  unparser,
  remaining,
  createParseFailure,
  sat,
  alts,
  fold,
  createParseSuccess,
  many,
  sepBy1,
  sepBy,
  eof,
  parser as p
} from '../src'
import { char } from '../src/char'
import { eqEithers } from './helpers'

describe('Parser', () => {
  it('unparser', () => {
    const { consumed, remaining } = unparser(p.zero())('s')
    assert.strictEqual(remaining, 's')
    eqEithers(consumed, createParseFailure('s', 'Parse failed on `fail`'))
  })

  it('sat', () => {
    const parser = sat(c => c === 'a')
    assert.strictEqual(remaining(parser.run('a')), '')
    assert.strictEqual(remaining(parser.run('b')), 'b')
  })

  it('alt', () => {
    const parser = p.alt(sat(c => c === 'a'), sat(c => c === 'b'))
    assert.strictEqual(remaining(parser.run('a')), '')
    assert.strictEqual(remaining(parser.run('b')), '')
    assert.strictEqual(remaining(parser.run('c')), 'c')
  })

  it('alts', () => {
    const parser = alts(sat(c => c === 'a'), sat(c => c === 'b'), sat(c => c === 'c'))
    assert.strictEqual(remaining(parser.run('a')), '')
    assert.strictEqual(remaining(parser.run('b')), '')
    assert.strictEqual(remaining(parser.run('c')), '')
    assert.strictEqual(remaining(parser.run('d')), 'd')
  })

  it('fold', () => {
    const parser = fold([char('a'), char('b')])
    eqEithers(parser.run('ab'), createParseSuccess('ab', ''))
  })

  it('many', () => {
    const parser = many(char('a'))
    eqEithers(parser.run('aa'), createParseSuccess(['a', 'a'], ''))
  })

  it('sepBy1', () => {
    const parser = sepBy1(char(','), sat(c => c !== ','))
    eqEithers(parser.run('a,b,c'), createParseSuccess(new NonEmptyArray('a', ['b', 'c']), ''))
  })

  it('seqBy', () => {
    const parser = sepBy(char(','), sat(c => c !== ','))
    eqEithers(parser.run('a,b,c'), createParseSuccess(['a', 'b', 'c'], ''))
  })

  it('eof', () => {
    const parser = eof
    eqEithers(parser.run('aa'), createParseFailure('aa', 'end of file'))
    eqEithers(parser.run(''), createParseSuccess(undefined, ''))
  })
})
