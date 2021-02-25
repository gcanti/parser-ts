import * as assert from 'assert'
import { array } from 'fp-ts/lib/Array'
import { monoidString } from 'fp-ts/lib/Monoid'
import { intercalate } from 'fp-ts/lib/Foldable'
import * as RA from 'fp-ts/lib/ReadonlyArray'

import { string as S } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { run } from './helpers'

describe('string', () => {
  describe('string', () => {
    it('should parse an empty string', () => {
      const parser = S.string('')

      assert.deepStrictEqual(run(parser, 'foo'), success('', stream(['f', 'o', 'o'], 0), stream(['f', 'o', 'o'])))
    })

    it('should parse a non-empty string', () => {
      const parser = S.string('foo')

      assert.deepStrictEqual(run(parser, 'foo'), success('foo', stream(['f', 'o', 'o'], 3), stream(['f', 'o', 'o'])))
      assert.deepStrictEqual(
        run(parser, 'foobar'),
        success('foo', stream(['f', 'o', 'o', 'b', 'a', 'r'], 3), stream(['f', 'o', 'o', 'b', 'a', 'r']))
      )
      assert.deepStrictEqual(run(parser, 'barfoo'), error(stream(['b', 'a', 'r', 'f', 'o', 'o']), ['"foo"']))
    })

    it('should handle long strings without exceeding the recursion limit (#41)', () => {
      const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      const target = intercalate(monoidString, RA.Foldable)(' ', RA.replicate(1000, lorem))
      const source = intercalate(monoidString, RA.Foldable)(' ', RA.replicate(10000, lorem))
      const cursor = target.length
      const parser = S.string(target)

      assert.deepStrictEqual(
        run(parser, source),
        success(target, stream(source.split(''), cursor), stream(source.split('')))
      )
    })
  })

  it('many', () => {
    const parser = S.many(S.string('ab'))
    assert.deepStrictEqual(run(parser, 'ab'), success('ab', stream(['a', 'b'], 2), stream(['a', 'b'])))
    assert.deepStrictEqual(
      run(parser, 'abab'),
      success('abab', stream(['a', 'b', 'a', 'b'], 4), stream(['a', 'b', 'a', 'b']))
    )
    assert.deepStrictEqual(run(parser, 'aba'), success('ab', stream(['a', 'b', 'a'], 2), stream(['a', 'b', 'a'])))
    assert.deepStrictEqual(run(parser, 'ac'), success('', stream(['a', 'c']), stream(['a', 'c'])))
  })

  it('oneOf', () => {
    const parser = S.oneOf(array)(['a', 'b'])
    assert.deepStrictEqual(run(parser, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, 'ab'), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'ba'), success('b', stream(['b', 'a'], 1), stream(['b', 'a'])))
    assert.deepStrictEqual(run(parser, 'ca'), error(stream(['c', 'a']), ['"a"', '"b"']))
  })

  it('int', () => {
    const parser = S.int
    assert.deepStrictEqual(run(parser, '1'), success(1, stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(run(parser, '-1'), success(-1, stream(['-', '1'], 2), stream(['-', '1'])))
    assert.deepStrictEqual(run(parser, '10'), success(10, stream(['1', '0'], 2), stream(['1', '0'])))
    assert.deepStrictEqual(run(parser, '-10'), success(-10, stream(['-', '1', '0'], 3), stream(['-', '1', '0'])))
    assert.deepStrictEqual(run(parser, '0.1'), success(0, stream(['0', '.', '1'], 1), stream(['0', '.', '1'])))
    assert.deepStrictEqual(
      run(parser, '-0.1'),
      success(-0, stream(['-', '0', '.', '1'], 2), stream(['-', '0', '.', '1']))
    )
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['an integer']))
  })

  it('float', () => {
    const parser = S.float
    assert.deepStrictEqual(run(parser, '1'), success(1, stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(run(parser, '-1'), success(-1, stream(['-', '1'], 2), stream(['-', '1'])))
    assert.deepStrictEqual(run(parser, '10'), success(10, stream(['1', '0'], 2), stream(['1', '0'])))
    assert.deepStrictEqual(run(parser, '-10'), success(-10, stream(['-', '1', '0'], 3), stream(['-', '1', '0'])))
    assert.deepStrictEqual(run(parser, '0.1'), success(0.1, stream(['0', '.', '1'], 3), stream(['0', '.', '1'])))
    assert.deepStrictEqual(
      run(parser, '-0.1'),
      success(-0.1, stream(['-', '0', '.', '1'], 4), stream(['-', '0', '.', '1']))
    )
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['a float']))
  })

  it('doubleQuotedString', () => {
    const parser = S.doubleQuotedString
    assert.deepStrictEqual(run(parser, '""'), success('', stream(['"', '"'], 2), stream(['"', '"'])))
    assert.deepStrictEqual(run(parser, '"a"'), success('a', stream(['"', 'a', '"'], 3), stream(['"', 'a', '"'])))
    assert.deepStrictEqual(
      run(parser, '"ab"'),
      success('ab', stream(['"', 'a', 'b', '"'], 4), stream(['"', 'a', 'b', '"']))
    )
    assert.deepStrictEqual(
      run(parser, '"ab"c'),
      success('ab', stream(['"', 'a', 'b', '"', 'c'], 4), stream(['"', 'a', 'b', '"', 'c']))
    )
    assert.deepStrictEqual(
      run(parser, '"a\\"b"'),
      success('a\\"b', stream(['"', 'a', '\\', '"', 'b', '"'], 6), stream(['"', 'a', '\\', '"', 'b', '"']))
    )
  })

  it('spaces', () => {
    const parser = S.spaces
    assert.deepStrictEqual(run(parser, ''), success('', stream([]), stream([])))
    assert.deepStrictEqual(run(parser, ' '), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(run(parser, '\t'), success('\t', stream(['\t'], 1), stream(['\t'])))
    assert.deepStrictEqual(run(parser, '\n'), success('\n', stream(['\n'], 1), stream(['\n'])))
    assert.deepStrictEqual(run(parser, '\n\t'), success('\n\t', stream(['\n', '\t'], 2), stream(['\n', '\t'])))
    assert.deepStrictEqual(run(parser, 'a'), success('', stream(['a']), stream(['a'])))
  })

  it('spaces1', () => {
    const parser = S.spaces1
    assert.deepStrictEqual(run(parser, ' '), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(run(parser, '  '), success('  ', stream([' ', ' '], 2), stream([' ', ' '])))
    assert.deepStrictEqual(run(parser, ' a'), success(' ', stream([' ', 'a'], 1), stream([' ', 'a'])))
    assert.deepStrictEqual(run(parser, '\n\t'), success('\n\t', stream(['\n', '\t'], 2), stream(['\n', '\t'])))
    assert.deepStrictEqual(run(parser, ''), error(stream([]), ['a whitespace']))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['a whitespace']))
  })
})
