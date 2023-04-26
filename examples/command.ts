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
 *   command: "foo",
 *   source: "foo ./bar -b --baz=qux",
 *   arguments: {
 *     flags: [
 *       "b"
 *     ],
 *     named: {
 *       baz: "qux",
 *     },
 *     positional: [
 *       "./bar"
 *     ]
 *   }
 * }
 * ```
 *
 * Parsing our statement into an AST allows us enforce that a statement conforms to some expected structure.
 * For example, one could generalize the parser exemplified below to accept any command. Then, the
 * structure of the parsed AST for specific commands can be enforced using instances of `io-ts` `Schema`s.
 */
import * as A from 'fp-ts/lib/Array'
import { mapLeft, Either } from 'fp-ts/lib/Either'
import { struct, Monoid } from 'fp-ts/lib/Monoid'
import * as R from 'fp-ts/lib/Record'
import { last } from 'fp-ts/lib/Semigroup'
import { absurd, pipe } from 'fp-ts/lib/function'
import * as C from '../src/char'
import { run } from '../src/code-frame'
import * as S from '../src/string'
import * as P from '../src/Parser'

// -------------------------------------------------------------------------------------
// models
// -------------------------------------------------------------------------------------

export type Argument = Flag | Named | Positional

export interface Flag {
  readonly _tag: 'Flag'
  readonly value: string
}

export interface Named {
  readonly _tag: 'Named'
  readonly name: string
  readonly value: string
}

export interface Positional {
  readonly _tag: 'Positional'
  readonly value: string
}

export interface Args {
  readonly flags: Array<string>
  readonly named: Record<string, string>
  readonly positional: Array<string>
}

export interface Ast {
  readonly command: string
  readonly source: string
  readonly args: Args
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

const monoidArgs: Monoid<Args> = struct({
  flags: A.getMonoid<string>(),
  named: R.getMonoid(last<string>()),
  positional: A.getMonoid<string>()
})

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export const Flag = (value: string): Flag => ({ _tag: 'Flag', value })

export const Named = (name: string, value: string): Named => ({ _tag: 'Named', name, value })

export const Positional = (value: string): Positional => ({ _tag: 'Positional', value })

export const FlagArg = (value: string): Args => ({
  flags: [value],
  named: R.empty,
  positional: A.empty
})

export const NamedArg = (name: string, value: string): Args => ({
  flags: A.empty,
  named: { [name]: value },
  positional: A.empty
})

export const PositionalArg = (value: string): Args => ({
  flags: A.empty,
  named: R.empty,
  positional: [value]
})

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

export const fold =
  <R>(onFlag: (value: string) => R, onNamed: (name: string, value: string) => R, onPositional: (value: string) => R) =>
  (a: Argument): R => {
    switch (a._tag) {
      case 'Flag':
        return onFlag(a.value)

      case 'Named':
        return onNamed(a.name, a.value)

      case 'Positional':
        return onPositional(a.value)

      default:
        return absurd<R>(a)
    }
  }

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
  pipe(
    whitespaceSurrounded(S.string(cmd)),
    P.bindTo('command'),
    P.bind('args', () => P.many(whitespaceSurrounded(argument)))
  )

const ast = (command: string, source: string): P.Parser<string, Ast> => {
  return pipe(
    statement(command),
    P.map(({ command, args }) => ({
      command,
      source,
      args: pipe(args, A.foldMap(monoidArgs)(fold(FlagArg, NamedArg, PositionalArg)))
    }))
  )
}

const parseCommand =
  <E>(cmd: string, onLeft: (cmd: string) => E) =>
  (source: string): Either<E, Ast> =>
    pipe(
      run(ast(cmd, source), source),
      mapLeft(() => onLeft(cmd))
    )

const cmd = 'foo'
const source = 'foo ./bar -b --baz=qux'

// tslint:disable-next-line: no-console
console.log(JSON.stringify(parseCommand(cmd, (c) => console.error(`command not found: ${c}`))(source), null, 2))
/*
{
  _tag: 'Right',
  right: {
    command: 'foo',
    source: 'foo ./bar -b --baz=qux',
    arguments: {
      flags: [
        "b"
      ],
      named: {
        baz: "qux",
      },
      positional: [
        "./bar",
      ],
    }
  }
}
*/
