import { Char } from '../src/char'
import { ParseResult } from '../src/ParseResult'
import { stream } from '../src/Stream'
import { Parser } from '../src/Parser'

export function run<A>(p: Parser<Char, A>, s: string): ParseResult<Char, A> {
  return p(stream(s.split('')))
}
