import * as assert from 'assert'
import { pipe } from 'fp-ts/lib/function'
import { none, some } from 'fp-ts/lib/Option'

import { char as C, parser as P, string as S } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'

describe('Parser', () => {
  it('eof', () => {
    const parser = P.eof<C.Char>()
    assert.deepStrictEqual(S.run('')(parser), success(undefined, stream([]), stream([])))
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['end of file']))
  })

  it('cut', () => {
    const parser = P.cut(C.char('a'))
    assert.deepStrictEqual(S.run('ab')(parser), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('bb')(parser), error(stream(['b', 'b']), ['"a"'], true))
  })

  it('either', () => {
    const parser1 = P.either(C.char('a'), () => C.char('b'))
    assert.deepStrictEqual(S.run('a')(parser1), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('b')(parser1), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(S.run('c')(parser1), error(stream(['c']), ['"a"', '"b"']))

    const parser2 = P.either(P.cut(C.char('a')), () => C.char('b'))
    assert.deepStrictEqual(S.run('c')(parser2), error(stream(['c']), ['"a"'], true))

    const parser3 = P.either(S.string('aa'), () => C.char('b'))
    assert.deepStrictEqual(S.run('ab')(parser3), error(stream(['a', 'b'], 1), ['"aa"']))

    const parser4 = P.either(C.char('a'), () => S.string('bb'))
    assert.deepStrictEqual(S.run('bc')(parser4), error(stream(['b', 'c'], 1), ['"bb"']))
  })

  it('map', () => {
    const parser = P.map(() => 'b')(C.char('a'))
    assert.deepStrictEqual(S.run('a')(parser), success('b', stream(['a'], 1), stream(['a'])))
  })

  it('ap', () => {
    const parser = P.ap(C.char('a'))(P.of(s => s.length))
    assert.deepStrictEqual(S.run('a')(parser), success(1, stream(['a'], 1), stream(['a'])))
  })

  it('apFirst', () => {
    const parser = P.apFirst(S.spaces)(C.char('a'))
    assert.deepStrictEqual(S.run('a ')(parser), success('a', stream(['a', ' '], 2), stream(['a', ' '])))
  })

  it('apSecond', () => {
    const parser = P.apSecond(S.spaces)(C.char('a'))
    assert.deepStrictEqual(S.run('a ')(parser), success(' ', stream(['a', ' '], 2), stream(['a', ' '])))
  })

  it('flatten', () => {
    const parser = P.of<string, P.Parser<string, string>>(C.char('a'))
    assert.deepStrictEqual(S.run('a')(P.flatten(parser)), success('a', stream(['a'], 1), stream(['a'])))
  })

  it('cutWith', () => {
    const parser = P.cutWith(C.char('a'), C.char('b'))
    assert.deepStrictEqual(S.run('ac')(parser), error(stream(['a', 'c'], 1), ['"b"'], true))
  })

  it('sepBy', () => {
    const parser = P.sepBy(
      C.char(','),
      P.sat(c => c !== ',')
    )
    assert.deepStrictEqual(S.run('')(parser), success([], stream([]), stream([])))
    assert.deepStrictEqual(S.run('a')(parser), success(['a'], stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(
      S.run('a,b')(parser),
      success(['a', 'b'], stream(['a', ',', 'b'], 3), stream(['a', ',', 'b']))
    )
  })

  it('sepBy1', () => {
    const parser = P.sepBy1(C.char(','), C.char('a'))
    assert.deepStrictEqual(S.run('')(parser), error(stream([]), ['"a"']))
    assert.deepStrictEqual(S.run('a,b')(parser), success(['a'], stream(['a', ',', 'b'], 1), stream(['a', ',', 'b'])))
  })

  it('sepByCut', () => {
    const parser = P.sepByCut(C.char(','), C.char('a'))
    assert.deepStrictEqual(S.run('a,b')(parser), error(stream(['a', ',', 'b'], 2), ['"a"'], true))
    assert.deepStrictEqual(
      S.run('a,a')(parser),
      success(['a', 'a'], stream(['a', ',', 'a'], 3), stream(['a', ',', 'a']))
    )
  })

  it('filter', () => {
    const parser = P.expected(P.filter((c: C.Char) => c !== 'a')(P.item<C.Char>()), 'anything except "a"')
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a']), ['anything except "a"']))
    assert.deepStrictEqual(S.run('b')(parser), success('b', stream(['b'], 1), stream(['b'])))
  })

  describe('between', () => {
    it('monomorphic', () => {
      const betweenParens = P.between(C.char('('), C.char(')'))
      const parser = betweenParens(C.char('a'))
      assert.deepStrictEqual(S.run('(a')(parser), error(stream(['(', 'a'], 2), ['")"']))
      assert.deepStrictEqual(S.run('(a)')(parser), success('a', stream(['(', 'a', ')'], 3), stream(['(', 'a', ')'])))
    })

    it('polymorphic', () => {
      const betweenParens = P.between(C.char('('), C.char(')'))
      const parser = betweenParens(S.int)
      assert.deepStrictEqual(S.run('(1')(parser), error(stream(['(', '1'], 2), ['")"']))
      assert.deepStrictEqual(S.run('(1)')(parser), success(1, stream(['(', '1', ')'], 3), stream(['(', '1', ')'])))
    })
  })

  describe('surroundedBy', () => {
    it('monomorphic', () => {
      const surroundedByPipes = P.surroundedBy(C.char('|'))
      const parser = surroundedByPipes(C.char('a'))
      assert.deepStrictEqual(S.run('|a')(parser), error(stream(['|', 'a'], 2), ['"|"']))
      assert.deepStrictEqual(S.run('|a|')(parser), success('a', stream(['|', 'a', '|'], 3), stream(['|', 'a', '|'])))
    })

    it('polymorphic', () => {
      const surroundedByPipes = P.surroundedBy(C.char('|'))
      const parser = surroundedByPipes(S.int)
      assert.deepStrictEqual(S.run('|1')(parser), error(stream(['|', '1'], 2), ['"|"']))
      assert.deepStrictEqual(S.run('|1|')(parser), success(1, stream(['|', '1', '|'], 3), stream(['|', '1', '|'])))
    })
  })

  it('lookAhead', () => {
    const parser = S.fold([S.string('a'), P.lookAhead(S.string('b')), S.string('b')])
    assert.deepStrictEqual(S.run('a')(parser), error(stream(['a'], 1), ['"b"']))
    assert.deepStrictEqual(S.run('ab')(parser), success('abb', stream(['a', 'b'], 2), stream(['a', 'b'])))
  })

  it('takeUntil', () => {
    const parser = P.takeUntil((char: C.Char) => char === 'c')
    assert.deepStrictEqual(S.run('ab')(parser), success(['a', 'b'], stream(['a', 'b'], 2), stream(['a', 'b'])))
    assert.deepStrictEqual(
      S.run('abc')(parser),
      success(['a', 'b'], stream(['a', 'b', 'c'], 2), stream(['a', 'b', 'c']))
    )
  })

  it('optional', () => {
    const parser = P.optional(P.sat((char: C.Char) => char === 'a'))
    assert.deepStrictEqual(S.run('a')(parser), success(some('a'), stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(S.run('b')(parser), success(none, stream(['b'], 0), stream(['b'])))
  })

  it('manyTill', () => {
    const parser = P.manyTill(C.letter, C.char('-'))
    assert.deepStrictEqual(S.run('a1-')(parser), error(stream(['a', '1', '-'], 1), ['"-"', 'a letter']))
    assert.deepStrictEqual(S.run('-')(parser), success([], stream(['-'], 1), stream(['-'])))
    assert.deepStrictEqual(
      S.run('abc-')(parser),
      success(['a', 'b', 'c'], stream(['a', 'b', 'c', '-'], 4), stream(['a', 'b', 'c', '-']))
    )
  })

  it('many1Till', () => {
    const parser = P.many1Till(C.letter, C.char('-'))
    assert.deepStrictEqual(S.run('a1-')(parser), error(stream(['a', '1', '-'], 1), ['"-"', 'a letter']))
    assert.deepStrictEqual(S.run('-')(parser), error(stream(['-'], 0), ['a letter']))
    assert.deepStrictEqual(
      S.run('abc-')(parser),
      success(['a', 'b', 'c'], stream(['a', 'b', 'c', '-'], 4), stream(['a', 'b', 'c', '-']))
    )
  })

  it('bind', () => {
    const parser = pipe(
      C.char('a'),
      P.bindTo('a'),
      P.bind('b', () => C.char('b')),
      P.map(({ a, b }) => [a, b])
    )
    assert.deepStrictEqual(S.run('ab')(parser), success(['a', 'b'], stream(['a', 'b'], 2), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('bc')(parser), error(stream(['b', 'c'], 0), ['"a"']))
  })

  it('bindTo', () => {
    const parser = pipe(
      C.char('a'),
      P.bindTo('headingA'),
      P.map(({ headingA }) => [headingA])
    )
    assert.deepStrictEqual(S.run('ab')(parser), success(['a'], stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(S.run('bc')(parser), error(stream(['b', 'c'], 0), ['"a"']))
  })
})
