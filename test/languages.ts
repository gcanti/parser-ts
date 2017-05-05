import * as p from '../src'
import * as s from '../src/string'
import * as c from '../src/char'

import { eqEithers } from './helpers'

describe('languages', () => {

  it('a parser for the string "hi <your name>!"', () => {
    const parser = s.string('hi')
      .chain(() => s.spaces1)
      .chain(() => s.many1(c.letter))
      .chain(name => s.string('!')
        .chain(() => p.of(name))
      )
    eqEithers(parser.run('hi Giulio!'), p.createParseSuccess('Giulio', ''))
    eqEithers(parser.run('hi Giulio'), p.createParseFailure('', '"!"'))
  })

  it('a parser for the first line of an HTTP request', () => {
    const parser = c.many1(c.upper) // Parse a sequence of 1 or more upper case letters
      .chain(method => s.spaces1 // Consume 1 or more spaces
        .chain(() => s.notSpaces1) // Parse a sequence of 1 or more non-whitespace characters
        .chain(path => s.spaces1 // Consume 1 or more spaces
          .chain(() => s.string('HTTP/')) // Match the string "HTTP/"
          .chain(() => p.fold([c.many1(c.digit), s.string('.'), c.many1(c.digit)])) // Parse the version string
          .chain(version => p.of({ // Return the final parsed value
            method,
            path,
            version
          }))
        )
      )
    eqEithers(parser.run('GET /lol.gif HTTP/1.0'), p.createParseSuccess({
      method: 'GET',
      path: '/lol.gif',
      version: '1.0'
    }, ''))
  })

  it('a parser for the path `/users/:user`', () => {
    const parser = s.string('/users/')
      .chain(() => s.int.map(n => ({ user: n })))
    eqEithers(parser.run('/users/1'), p.createParseSuccess({ user: 1 }, ''))
    eqEithers(parser.run('/users/a'), p.createParseFailure('a', 'an integer'))
  })

})
