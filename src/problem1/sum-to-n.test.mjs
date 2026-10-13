import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_N, sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum-to-n.js'

const implementations = [sum_to_n_a, sum_to_n_b, sum_to_n_c]
const exactSum = (n) => Number((BigInt(n) * (BigInt(n) + 1n)) / 2n)

for (const implementation of implementations) {
  test(`${implementation.name}: zero, odd/even and independent exact oracle`, () => {
    for (const n of [0, 1, 2, 5, 100, 999, 10_000]) {
      assert.equal(implementation(n), exactSum(n))
    }
  })
  test(`${implementation.name}: rejects unsupported inputs`, () => {
    for (const n of [-1, 1.5, NaN, Infinity, '5', MAX_N + 1]) {
      assert.throws(() => implementation(n), RangeError)
    }
  })
}
test('fast implementations stay exact at the safe-integer boundary', () => {
  for (const n of [MAX_N - 1, MAX_N]) {
    assert.equal(sum_to_n_b(n), exactSum(n))
    assert.equal(sum_to_n_c(n), exactSum(n))
  }
})
