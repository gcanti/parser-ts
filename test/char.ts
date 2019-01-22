import { createParseSuccess, createParseFailure } from '../src'
import { char, many, many1, notChar, oneOf, digit, space, alphanum, lower, notOneOf } from '../src/char'
import { eqEithers } from './helpers'

describe('char', () => {
  it('char', () => {
    const parser = char('a')
    eqEithers(parser.run('ab'), createParseSuccess('a', 'b'))
    eqEithers(parser.run('bb'), createParseFailure('bb', '"a"'))
  })

  it('many', () => {
    const parser = many(char('a'))
    eqEithers(parser.run('b'), createParseSuccess('', 'b'))
    eqEithers(parser.run('ab'), createParseSuccess('a', 'b'))
    eqEithers(parser.run('aab'), createParseSuccess('aa', 'b'))
  })

  it('many1', () => {
    const parser = many1(char('a'))
    eqEithers(parser.run('ab'), createParseSuccess('a', 'b'))
    eqEithers(parser.run('b'), createParseFailure('b', '"a"'))
    eqEithers(parser.run('aab'), createParseSuccess('aa', 'b'))
  })

  it('notChar', () => {
    const parser = notChar('a')
    eqEithers(parser.run('b'), createParseSuccess('b', ''))
    eqEithers(parser.run('a'), createParseFailure('a', 'anything but "a"'))
  })

  it('oneOf', () => {
    const parser = oneOf('ab')
    eqEithers(parser.run('a'), createParseSuccess('a', ''))
    eqEithers(parser.run('b'), createParseSuccess('b', ''))
    eqEithers(parser.run('c'), createParseFailure('c', 'One of "ab"'))
  })

  it('digit', () => {
    const parser = digit
    eqEithers(parser.run('1'), createParseSuccess('1', ''))
    eqEithers(parser.run('a'), createParseFailure('a', 'a digit'))
  })

  it('space', () => {
    const parser = space
    eqEithers(parser.run(' '), createParseSuccess(' ', ''))
    eqEithers(parser.run('\t'), createParseSuccess('\t', ''))
    eqEithers(parser.run('\n'), createParseSuccess('\n', ''))
    eqEithers(parser.run('a'), createParseFailure('a', 'whitespace'))
  })

  it('alphanum', () => {
    const parser = alphanum
    eqEithers(parser.run('a'), createParseSuccess('a', ''))
    eqEithers(parser.run('1'), createParseSuccess('1', ''))
    eqEithers(parser.run('_'), createParseSuccess('_', ''))
    eqEithers(parser.run('@'), createParseFailure('@', 'a word character'))
  })

  it('lower', () => {
    const parser = lower
    eqEithers(parser.run('a'), createParseSuccess('a', ''))
    eqEithers(parser.run('A'), createParseFailure('A', 'a lower case letter'))
  })

  it('notOneOf', () => {
    const parser = notOneOf('bc')
    eqEithers(parser.run('a'), createParseSuccess('a', ''))
    eqEithers(parser.run('b'), createParseFailure('b', 'Not one of "bc"'))
    eqEithers(parser.run('c'), createParseFailure('c', 'Not one of "bc"'))
  })
})
