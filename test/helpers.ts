import * as assert from 'assert'
import { Either, isLeft, isRight } from 'fp-ts/lib/Either'

export function eqEithers<L, A>(x: Either<L, A>, y: Either<L, A>) {
  if (isRight(x) && isRight(y)) {
    assert.deepEqual(x.value, y.value)
  } else if (isLeft(x) && isLeft(y)) {
    assert.deepEqual(x.value, y.value)
  } else {
    assert.strictEqual(isLeft(x), isLeft(y), `${x} != ${y}`)
  }
}
