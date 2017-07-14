import { createParseSuccess, createParseFailure } from '../src'
import { string, many, oneOf, int, float, doubleQuotedString } from '../src/string'
import { eqEithers } from './helpers'

describe('string', () => {
  it('string', () => {
    const parser = string('foo')
    eqEithers(parser.run('foo'), createParseSuccess('foo', ''))
    eqEithers(parser.run('foobar'), createParseSuccess('foo', 'bar'))
    eqEithers(parser.run('barfoo'), createParseFailure('barfoo', '"foo"'))
  })

  it('many', () => {
    const parser = many(string('foo'))
    eqEithers(parser.run('foo'), createParseSuccess('foo', ''))
    eqEithers(parser.run('foofoo'), createParseSuccess('foofoo', ''))
    eqEithers(parser.run('foobar'), createParseSuccess('foo', 'bar'))
    eqEithers(parser.run('bar'), createParseSuccess('', 'bar'))
  })

  it('oneOf', () => {
    const parser = oneOf(['foo', 'bar'])
    eqEithers(parser.run('foo'), createParseSuccess('foo', ''))
    eqEithers(parser.run('foobar'), createParseSuccess('foo', 'bar'))
    eqEithers(parser.run('barfoo'), createParseSuccess('bar', 'foo'))
    eqEithers(parser.run('bazfoo'), createParseFailure('bazfoo', `one of ["foo","bar"]`))
  })

  it('int', () => {
    const parser = int
    eqEithers(parser.run('1'), createParseSuccess(1, ''))
    eqEithers(parser.run('-1'), createParseSuccess(-1, ''))
    eqEithers(parser.run('10'), createParseSuccess(10, ''))
    eqEithers(parser.run('-10'), createParseSuccess(-10, ''))
    eqEithers(parser.run('0.1'), createParseSuccess(0, '.1'))
    eqEithers(parser.run('-0.1'), createParseSuccess(0, '.1'))
    eqEithers(parser.run('a'), createParseFailure('a', `an integer`))
  })

  it('float', () => {
    const parser = float
    eqEithers(parser.run('1'), createParseSuccess(1, ''))
    eqEithers(parser.run('-1'), createParseSuccess(-1, ''))
    eqEithers(parser.run('10'), createParseSuccess(10, ''))
    eqEithers(parser.run('-10'), createParseSuccess(-10, ''))
    eqEithers(parser.run('0.1'), createParseSuccess(0.1, ''))
    eqEithers(parser.run('-0.1'), createParseSuccess(-0.1, ''))
    eqEithers(parser.run('a'), createParseFailure('a', `an integer`))
  })

  it('doubleQuotedString', () => {
    const parser = doubleQuotedString
    eqEithers(parser.run('""'), createParseSuccess('', ''))
    eqEithers(parser.run('"a"'), createParseSuccess('a', ''))
    eqEithers(parser.run('"ab"'), createParseSuccess('ab', ''))
    eqEithers(parser.run('"ab"c'), createParseSuccess('ab', 'c'))
    eqEithers(parser.run('"a\\"b"'), createParseSuccess('a\\"b', ''))
  })
})
