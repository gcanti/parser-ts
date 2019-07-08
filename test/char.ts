import * as assert from 'assert'
import { char as C } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { run } from './helpers'

describe('char', () => {
  it('char', () => {
    const parser = C.char('a')
    assert.deepStrictEqual(run(parser, 'ab'), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'bb'), error(stream(['b', 'b']), ['"a"']))
  })

  it('many', () => {
    const parser = C.many(C.char('a'))
    assert.deepStrictEqual(run(parser, 'b'), success('', stream(['b']), stream(['b'])))
    assert.deepStrictEqual(run(parser, 'ab'), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'aab'), success('aa', stream(['a', 'a', 'b'], 2), stream(['a', 'a', 'b'])))
  })

  it('many1', () => {
    const parser = C.many1(C.char('a'))
    assert.deepStrictEqual(run(parser, 'b'), error(stream(['b']), ['"a"']))
    assert.deepStrictEqual(run(parser, 'ab'), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'aab'), success('aa', stream(['a', 'a', 'b'], 2), stream(['a', 'a', 'b'])))
  })

  it('notChar', () => {
    const parser = C.notChar('a')
    assert.deepStrictEqual(run(parser, 'b'), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['anything but "a"']))
  })

  it('oneOf', () => {
    const parser = C.oneOf('ab')
    assert.deepStrictEqual(run(parser, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, 'b'), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(run(parser, 'c'), error(stream(['c']), ['One of "ab"']))
  })

  it('digit', () => {
    const parser = C.digit
    assert.deepStrictEqual(run(parser, '1'), success('1', stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['a digit']))
  })

  it('space', () => {
    const parser = C.space
    assert.deepStrictEqual(run(parser, ' '), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(run(parser, '\t'), success('\t', stream(['\t'], 1), stream(['\t'])))
    assert.deepStrictEqual(run(parser, '\n'), success('\n', stream(['\n'], 1), stream(['\n'])))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['a whitespace']))
  })

  it('alphanum', () => {
    const parser = C.alphanum
    assert.deepStrictEqual(run(parser, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, '1'), success('1', stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(run(parser, '_'), success('_', stream(['_'], 1), stream(['_'])))
    assert.deepStrictEqual(run(parser, '@'), error(stream(['@']), ['a word character']))
  })

  it('upper', () => {
    const parser = C.upper
    assert.deepStrictEqual(run(parser, 'A'), success('A', stream(['A'], 1), stream(['A'])))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['an upper case letter']))
  })

  it('lower', () => {
    const parser = C.lower
    assert.deepStrictEqual(run(parser, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, 'A'), error(stream(['A']), ['a lower case letter']))
  })

  it('notOneOf', () => {
    const parser = C.notOneOf('bc')
    assert.deepStrictEqual(run(parser, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, 'b'), error(stream(['b']), ['Not one of "bc"']))
    assert.deepStrictEqual(run(parser, 'c'), error(stream(['c']), ['Not one of "bc"']))
  })
})
