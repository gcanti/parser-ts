import * as assert from 'assert'
import { array } from 'fp-ts/lib/Array'
import { intercalate } from 'fp-ts/lib/Foldable'
import * as RA from 'fp-ts/lib/ReadonlyArray'
import { Monoid } from 'fp-ts/lib/string'

import { char as C, string as S } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'

describe('string', () => {
  describe('string', () => {
    it('should parse an empty string', () => {
      const parser = S.string('')

      assert.deepStrictEqual(S.run('foo')(parser), success('', stream(['f', 'o', 'o'], 0), stream(['f', 'o', 'o'])))
    })

    it('should parse a non-empty string', () => {
      const parser = S.string('foo')

      assert.deepStrictEqual(S.run('foo')(parser), success('foo', stream(['f', 'o', 'o'], 3), stream(['f', 'o', 'o'])))
      assert.deepStrictEqual(
        S.run('foobar')(parser),
        success('foo', stream(['f', 'o', 'o', 'b', 'a', 'r'], 3), stream(['f', 'o', 'o', 'b', 'a', 'r']))
      )
      assert.deepStrictEqual(S.run('barfoo')(parser), error(stream(['b', 'a', 'r', 'f', 'o', 'o']), ['"foo"']))
    })

    it('should handle long strings without exceeding the recursion limit (#41)', () => {
      const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      const target = intercalate(Monoid, RA.Foldable)(' ', RA.replicate(1000, lorem))
      const source = intercalate(Monoid, RA.Foldable)(' ', RA.replicate(10000, lorem))
      const cursor = target.length
      const parser = S.string(target)

      assert.deepStrictEqual(
        S.run(source)(parser),
        success(target, stream(source.split(''), cursor), stream(source.split('')))
      )
    })
  })

  describe('many', () => {
    it('should handle repeated sequences of the target string', () => {
      const parser = S.many(S.string('ab'))
      assert.deepStrictEqual(S.run('ab')(parser), success('ab', stream(['a', 'b'], 2), stream(['a', 'b'])))
      assert.deepStrictEqual(
        S.run('abab')(parser),
        success('abab', stream(['a', 'b', 'a', 'b'], 4), stream(['a', 'b', 'a', 'b']))
      )
      assert.deepStrictEqual(S.run('aba')(parser), success('ab', stream(['a', 'b', 'a'], 2), stream(['a', 'b', 'a'])))
      assert.deepStrictEqual(S.run('ac')(parser), success('', stream(['a', 'c']), stream(['a', 'c'])))
    })

    it('should handle long sequences without exceeding the recursion limit (#45)', () => {
      const source = 'a'.repeat(10000)
      assert.deepStrictEqual(
        S.run(source)(S.many(C.alphanum)),
        success(source, stream(source.split(''), source.length), stream(source.split('')))
      )
    })
  })

  it('oneOf', () => {
    const parser = S.oneOf(array)(['a', 'b'])
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('ba')(parser), success('b', stream(['b', 'a'], 1), stream(['b', 'a'])))
    assert.deepStrictEqual(S.run('ca')(parser), error(stream(['c', 'a']), ['"a"', '"b"']))
  })

  it('int', () => {
    const parser = S.int
    assert.deepStrictEqual(S.run('1')(parser), success(1, stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(S.run('-1')(parser), success(-1, stream(['-', '1'], 2), stream(['-', '1'])))
    assert.deepStrictEqual(S.run('10')(parser), success(10, stream(['1', '0'], 2), stream(['1', '0'])))
    assert.deepStrictEqual(S.run('-10')(parser), success(-10, stream(['-', '1', '0'], 3), stream(['-', '1', '0'])))
    assert.deepStrictEqual(S.run('0.1')(parser), success(0, stream(['0', '.', '1'], 1), stream(['0', '.', '1'])))
    assert.deepStrictEqual(
      S.run('-0.1')(parser),
      success(-0, stream(['-', '0', '.', '1'], 2), stream(['-', '0', '.', '1']))
    )
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['an integer']))
  })

  it('float', () => {
    const parser = S.float
    assert.deepStrictEqual(S.run('1')(parser), success(1, stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(S.run('-1')(parser), success(-1, stream(['-', '1'], 2), stream(['-', '1'])))
    assert.deepStrictEqual(S.run('10')(parser), success(10, stream(['1', '0'], 2), stream(['1', '0'])))
    assert.deepStrictEqual(S.run('-10')(parser), success(-10, stream(['-', '1', '0'], 3), stream(['-', '1', '0'])))
    assert.deepStrictEqual(S.run('0.1')(parser), success(0.1, stream(['0', '.', '1'], 3), stream(['0', '.', '1'])))
    assert.deepStrictEqual(
      S.run('-0.1')(parser),
      success(-0.1, stream(['-', '0', '.', '1'], 4), stream(['-', '0', '.', '1']))
    )
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['a float']))
  })

  it('doubleQuotedString', () => {
    const parser = S.doubleQuotedString
    assert.deepStrictEqual(S.run('""')(parser), success('', stream(['"', '"'], 2), stream(['"', '"'])))
    assert.deepStrictEqual(S.run('"a"')(parser), success('a', stream(['"', 'a', '"'], 3), stream(['"', 'a', '"'])))
    assert.deepStrictEqual(
      S.run('"ab"')(parser),
      success('ab', stream(['"', 'a', 'b', '"'], 4), stream(['"', 'a', 'b', '"']))
    )
    assert.deepStrictEqual(
      S.run('"ab"c')(parser),
      success('ab', stream(['"', 'a', 'b', '"', 'c'], 4), stream(['"', 'a', 'b', '"', 'c']))
    )
    assert.deepStrictEqual(
      S.run('"a\\"b"')(parser),
      success('a\\"b', stream(['"', 'a', '\\', '"', 'b', '"'], 6), stream(['"', 'a', '\\', '"', 'b', '"']))
    )
  })

  it('spaces', () => {
    const parser = S.spaces
    assert.deepStrictEqual(S.run('')(parser), success('', stream([]), stream([])))
    assert.deepStrictEqual(S.run(' ')(parser), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(S.run('\t')(parser), success('\t', stream(['\t'], 1), stream(['\t'])))
    assert.deepStrictEqual(S.run('\n')(parser), success('\n', stream(['\n'], 1), stream(['\n'])))
    assert.deepStrictEqual(S.run('\n\t')(parser), success('\n\t', stream(['\n', '\t'], 2), stream(['\n', '\t'])))
    assert.deepStrictEqual(S.run('a')(parser), success('', stream(['a']), stream(['a'])))
  })

  it('spaces1', () => {
    const parser = S.spaces1
    assert.deepStrictEqual(S.run(' ')(parser), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(S.run('  ')(parser), success('  ', stream([' ', ' '], 2), stream([' ', ' '])))
    assert.deepStrictEqual(S.run(' a')(parser), success(' ', stream([' ', 'a'], 1), stream([' ', 'a'])))
    assert.deepStrictEqual(S.run('\n\t')(parser), success('\n\t', stream(['\n', '\t'], 2), stream(['\n', '\t'])))
    assert.deepStrictEqual(S.run('')(parser), error(stream([]), ['a whitespace']))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['a whitespace']))
  })
})
