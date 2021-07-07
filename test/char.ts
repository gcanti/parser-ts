import * as assert from 'assert'
import { char as C, string as S } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'

describe('char', () => {
  it('char', () => {
    const parser = C.char('a')
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('Ab')(parser), error(stream(['A', 'b']), ['"a"']))
    assert.deepStrictEqual(S.run('bb')(parser), error(stream(['b', 'b']), ['"a"']))
  })

  it('charC', () => {
    const parser = C.charC('a')
    assert.deepStrictEqual(S.run('Ab')(parser), success('A', stream(['A', 'b'], 1), stream(['A', 'b'])))
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('bb')(parser), error(stream(['b', 'b']), ['"a"', '"A"']))

    const parser2 = C.charC('A')
    assert.deepStrictEqual(S.run('Ab')(parser2), success('A', stream(['A', 'b'], 1), stream(['A', 'b'])))
    assert.deepStrictEqual(S.run('ab')(parser2), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('bb')(parser2), error(stream(['b', 'b']), ['"a"', '"A"']))
  })

  it('run', () => {
    const parser = C.char('a')
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
  })

  it('many', () => {
    const parser = C.many(C.char('a'))
    assert.deepStrictEqual(S.run('b')(parser), success('', stream(['b']), stream(['b'])))
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('aab')(parser), success('aa', stream(['a', 'a', 'b'], 2), stream(['a', 'a', 'b'])))
  })

  it('many1', () => {
    const parser = C.many1(C.char('a'))
    assert.deepStrictEqual(S.run('b')(parser), error(stream(['b']), ['"a"']))
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('aab')(parser), success('aa', stream(['a', 'a', 'b'], 2), stream(['a', 'a', 'b'])))
  })

  it('notChar', () => {
    const parser = C.notChar('a')
    assert.deepStrictEqual(S.run('b')(parser), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['anything but "a"']))
  })

  it('oneOf', () => {
    const parser = C.oneOf('ab')
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('b')(parser), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(S.run('c')(parser), error(stream(['c']), ['One of "ab"']))
  })

  it('digit', () => {
    const parser = C.digit
    assert.deepStrictEqual(S.run('1')(parser), success('1', stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['a digit']))
  })

  it('space', () => {
    const parser = C.space
    assert.deepStrictEqual(S.run(' ')(parser), success(' ', stream([' '], 1), stream([' '])))
    assert.deepStrictEqual(S.run('\t')(parser), success('\t', stream(['\t'], 1), stream(['\t'])))
    assert.deepStrictEqual(S.run('\n')(parser), success('\n', stream(['\n'], 1), stream(['\n'])))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['a whitespace']))
  })

  it('alphanum', () => {
    const parser = C.alphanum
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('1')(parser), success('1', stream(['1'], 1), stream(['1'])))
    assert.deepStrictEqual(S.run('_')(parser), success('_', stream(['_'], 1), stream(['_'])))
    assert.deepStrictEqual(S.run('@')(parser), error(stream(['@']), ['a word character']))
  })

  it('upper', () => {
    const parser = C.upper
    assert.deepStrictEqual(S.run('A')(parser), success('A', stream(['A'], 1), stream(['A'])))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['an upper case letter']))
  })

  it('lower', () => {
    const parser = C.lower
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('A')(parser), error(stream(['A']), ['a lower case letter']))
  })

  it('notOneOf', () => {
    const parser = C.notOneOf('bc')
    assert.deepStrictEqual(S.run('a')(parser), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('b')(parser), error(stream(['b']), ['Not one of "bc"']))
    assert.deepStrictEqual(S.run('c')(parser), error(stream(['c']), ['Not one of "bc"']))
  })
})
