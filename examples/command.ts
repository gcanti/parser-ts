/**
 * In this example, we utilize the combinators from `parser-ts` to demonstrate one possible implementation
 * of parsing command line statements into a structured abstract syntax tree (AST). Our parser will be
 * capable of handling a command, named arguments, positional arguments, and flags.
 *
 * An example statement might look something like
 *
 * ```
 * foo ./bar -b --baz=qux
 * ```
 *
 * which will then be parsed into an AST with the following structure
 *
 * ```
 * {
 *   command: 'foo',
 *   source: 'foo ./bar -b --baz=qux',
 *   arguments: {
 *     flags: {
 *       b: true
 *     }
 *     named: {
 *       baz: "qux",
 *     },
 *     positional: {
 *       0: "./bar",
 *     },
 *   }
 * }
 * ```
 *
 * Parsing our statement into an AST allows us enforce that a statement conforms to some expected structure.
 * For example, one could generalize the parser exemplified below to accept any command. Then, the
 * structure of the parsed AST for specific commands can be enforced using instances of `io-ts` `Schema`s.
 */
import { array, filter } from 'fp-ts/lib/Array'
import { bimap, Either } from 'fp-ts/lib/Either'
import { fromFoldableMap, isEmpty } from 'fp-ts/lib/Record'
import { getLastSemigroup } from 'fp-ts/lib/Semigroup'
import { fold } from 'fp-ts/lib/boolean'
import { identity, tuple, Refinement } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { Do } from 'fp-ts-contrib/lib/Do'
import * as C from '../src/char'
import * as S from '../src/string'
import * as P from '../src/Parser'
import { run } from '../src/code-frame'

// -------------------------------------------------------------------------------------
// models
// -------------------------------------------------------------------------------------

export type Statement = Command | Argument

export interface Command {
  _tag: 'Command'
  value: string
}

export type Argument = Flag | Named | Positional

export interface Flag {
  _tag: 'Flag'
  value: string
}

export interface Named {
  _tag: 'Named'
  name: string
  value: string
}

export interface Positional {
  _tag: 'Positional'
  value: string
}

export interface Ast {
  command: string
  source: string
  args: {
    flags: Record<string, true> | null
    named: Record<string, string> | null
    positional: Record<number, string> | null
  }
}

// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------

const isFlag: Refinement<Argument, Flag> = (a): a is Flag => a._tag === 'Flag'

const isNamed: Refinement<Argument, Named> = (a): a is Named => a._tag === 'Named'

const isPositional: Refinement<Argument, Positional> = (a): a is Positional => a._tag === 'Positional'

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const Command = (value: string): Command => ({ _tag: 'Command', value })

export const Flag = (value: string): Flag => ({ _tag: 'Flag', value })

export const Named = (name: string, value: string): Named => ({ _tag: 'Named', name, value })

export const Positional = (value: string): Positional => ({ _tag: 'Positional', value })

// -------------------------------------------------------------------------------------
// parsers
// -------------------------------------------------------------------------------------

const whitespaceSurrounded = P.surroundedBy(S.spaces)

const dash = C.char('-')

const doubleDash = S.string('--')

const equals = C.char('=')

const identifier = C.many1(C.alphanum)

const flag: P.Parser<string, Flag> = pipe(
  dash,
  P.chain(() => identifier),
  P.map(Flag)
)

const named: P.Parser<string, Named> = pipe(
  doubleDash,
  P.chain(() => P.sepBy1(equals, identifier)),
  P.map(([name, value]) => Named(name, value))
)

const positional: P.Parser<string, Positional> = pipe(C.many1(C.notSpace), P.map(Positional))

const argument = P.either<string, Argument>(flag, () => P.either<string, Argument>(named, () => positional))

const statement = (cmd: string) =>
  Do(P.parser)
    .bind('command', whitespaceSurrounded(S.string(cmd)))
    .bind('args', P.many(whitespaceSurrounded(argument)))
    .done()

const namedToRecord = (as: Array<Named>): Record<string, string> =>
  fromFoldableMap(getLastSemigroup<string>(), array)(as, a => [a.name, a.value])

const positionalToRecord = (as: Array<Positional>): Record<number, string> => {
  const withIndex = array.mapWithIndex(as, (i, a) => tuple(String(i), a.value))
  return fromFoldableMap(getLastSemigroup<string>(), array)(withIndex, identity)
}

const flagToRecord = (as: Array<Flag>): Record<string, true> =>
  fromFoldableMap(getLastSemigroup<true>(), array)(as, a => [a.value, true])

const nullIfEmpty = <A extends Record<any, unknown>>(a: A): A | null =>
  pipe(
    isEmpty(a),
    fold(
      () => a,
      () => null
    )
  )

const ast = (command: string, source: string): P.Parser<string, Ast> => {
  return pipe(
    statement(command),
    P.map(({ command, args }) => ({
      command,
      source,
      args: {
        flags: pipe(args, filter(isFlag), flagToRecord, nullIfEmpty),
        named: pipe(args, filter(isNamed), namedToRecord, nullIfEmpty),
        positional: pipe(args, filter(isPositional), positionalToRecord, nullIfEmpty)
      }
    }))
  )
}

const parseCommand = <E>(cmd: string, onLeft: (cmd: string) => E) => (source: string): Either<E, Ast> =>
  pipe(
    run(ast(cmd, source), source),
    bimap(() => onLeft(cmd), identity)
  )

const cmd = 'foo'
const source = 'foo ./bar -b --baz=qux'

parseCommand(cmd, c => console.error(`command not found: ${c}`))(source)
/*
{
  _tag: 'Right',
  right: {
    command: 'foo',
    source: 'foo ./bar -b --baz=qux',
    args: {
      flags: {
        b: true
      },
      named: {
        baz: 'qux'
      },
      positional: {
        '0': './bar'
      }
    }
  }
}
*/
