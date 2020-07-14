import * as assert from 'assert'
import { char as C, parser as P, string as S } from '../src'
import { error, success } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { run } from './helpers'

describe('Parser', () => {
  it('eof', () => {
    const parser = P.eof<C.Char>()
    assert.deepStrictEqual(run(parser, ''), success(undefined, stream([]), stream([])))
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a']), ['end of file']))
  })

  it('cut', () => {
    const parser = P.cut(C.char('a'))
    assert.deepStrictEqual(run(parser, 'ab'), success('a', stream(['a', 'b'], 1), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'bb'), error(stream(['b', 'b']), ['"a"'], true))
  })

  it('either', () => {
    const parser1 = P.either(C.char('a'), () => C.char('b'))
    assert.deepStrictEqual(run(parser1, 'a'), success('a', stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser1, 'b'), success('b', stream(['b'], 1), stream(['b'])))
    assert.deepStrictEqual(run(parser1, 'c'), error(stream(['c']), ['"a"', '"b"']))
    const parser2 = P.either(P.cut(C.char('a')), () => C.char('b'))
    assert.deepStrictEqual(run(parser2, 'c'), error(stream(['c']), ['"a"'], true))
    const parser3 = P.either(S.string('aa'), () => C.char('b'))
    assert.deepStrictEqual(run(parser3, 'ab'), error(stream(['a', 'b'], 1), ['"aa"']))
    const parser4 = P.either(C.char('a'), () => S.string('bb'))
    assert.deepStrictEqual(run(parser4, 'bc'), error(stream(['b', 'c'], 1), ['"bb"']))
  })

  it('cutWith', () => {
    const parser = P.cutWith(C.char('a'), C.char('b'))
    assert.deepStrictEqual(run(parser, 'ac'), error(stream(['a', 'c'], 1), ['"b"'], true))
  })

  it('sepBy', () => {
    const parser = P.sepBy(
      C.char(','),
      P.sat(c => c !== ',')
    )
    assert.deepStrictEqual(run(parser, ''), success([], stream([]), stream([])))
    assert.deepStrictEqual(run(parser, 'a'), success(['a'], stream(['a'], 1), stream(['a'])))
    assert.deepStrictEqual(run(parser, 'a,b'), success(['a', 'b'], stream(['a', ',', 'b'], 3), stream(['a', ',', 'b'])))
  })

  it('sepBy1', () => {
    const parser = P.sepBy1(C.char(','), C.char('a'))
    assert.deepStrictEqual(run(parser, ''), error(stream([]), ['"a"']))
    assert.deepStrictEqual(run(parser, 'a,b'), success(['a'], stream(['a', ',', 'b'], 1), stream(['a', ',', 'b'])))
  })

  it('sepByCut', () => {
    const parser = P.sepByCut(C.char(','), C.char('a'))
    assert.deepStrictEqual(run(parser, 'a,b'), error(stream(['a', ',', 'b'], 2), ['"a"'], true))
    assert.deepStrictEqual(run(parser, 'a,a'), success(['a', 'a'], stream(['a', ',', 'a'], 3), stream(['a', ',', 'a'])))
  })

  describe('between', () => {
    it('monomorphic', () => {
      const betweenParens = P.between(C.char('('), C.char(')'))
      const parser = betweenParens(C.char('a'))
      assert.deepStrictEqual(run(parser, '(a'), error(stream(['(', 'a'], 2), ['")"']))
      assert.deepStrictEqual(run(parser, '(a)'), success('a', stream(['(', 'a', ')'], 3), stream(['(', 'a', ')'])))
    })

    it('polymorphic', () => {
      const betweenParens = P.between(C.char('('), C.char(')'))
      const parser = betweenParens(S.int)
      assert.deepStrictEqual(run(parser, '(1'), error(stream(['(', '1'], 2), ['")"']))
      assert.deepStrictEqual(run(parser, '(1)'), success(1, stream(['(', '1', ')'], 3), stream(['(', '1', ')'])))
    })
  })

  describe('surroundedBy', () => {
    it('monomorphic', () => {
      const surroundedByPipes = P.surroundedBy(C.char('|'))
      const parser = surroundedByPipes(C.char('a'))
      assert.deepStrictEqual(run(parser, '|a'), error(stream(['|', 'a'], 2), ['"|"']))
      assert.deepStrictEqual(run(parser, '|a|'), success('a', stream(['|', 'a', '|'], 3), stream(['|', 'a', '|'])))
    })

    it('polymorphic', () => {
      const surroundedByPipes = P.surroundedBy(C.char('|'))
      const parser = surroundedByPipes(S.int)
      assert.deepStrictEqual(run(parser, '|1'), error(stream(['|', '1'], 2), ['"|"']))
      assert.deepStrictEqual(run(parser, '|1|'), success(1, stream(['|', '1', '|'], 3), stream(['|', '1', '|'])))
    })
  })

  it('lookAhead', () => {
    const parser = S.fold([S.string('a'), P.lookAhead(S.string('b')), S.string('b')])
    assert.deepStrictEqual(run(parser, 'a'), error(stream(['a'], 1), ['"b"']))
    assert.deepStrictEqual(run(parser, 'ab'), success('abb', stream(['a', 'b'], 2), stream(['a', 'b'])))
  })

  it('takeUntil', () => {
    const parser = P.takeUntil((char: C.Char) => char === 'c')
    assert.deepStrictEqual(run(parser, 'ab'), success(['a', 'b'], stream(['a', 'b'], 2), stream(['a', 'b'])))
    assert.deepStrictEqual(run(parser, 'abc'), success(['a', 'b'], stream(['a', 'b', 'c'], 2), stream(['a', 'b', 'c'])))
  })
})
