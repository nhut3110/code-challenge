import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareBalances, getUsdValue, getPriority } from './balances.ts'

const balance = (id, blockchain, amount) => ({ id, blockchain, amount, currency: 'ETH' })

// Independent baseline: only correct the undefined variable and use formatted rows.
const originalPriority = (chain) => {
  switch (chain) {
    case 'Osmosis':
      return 100
    case 'Ethereum':
      return 50
    case 'Arbitrum':
      return 30
    case 'Zilliqa':
    case 'Neo':
      return 20
    default:
      return -99
  }
}
const originalPipeline = (balances) =>
  balances
    .filter((item) => originalPriority(item.blockchain) > -99 && item.amount <= 0)
    .sort((left, right) => {
      const lhs = originalPriority(left.blockchain),
        rhs = originalPriority(right.blockchain)
      if (lhs > rhs) return -1
      if (rhs > lhs) return 1
    })
    .map((item) => ({ ...item, formatted: item.amount.toFixed() }))

test('preserves original filter, rounding, priorities and stable ties without mutation', () => {
  const source = Object.freeze([
    Object.freeze(balance('neo', 'Neo', -1)),
    Object.freeze(balance('eth', 'Ethereum', -2.125)),
    Object.freeze(balance('zero', 'Osmosis', 0)),
    Object.freeze(balance('unknown', 'Unknown', -5)),
    Object.freeze(balance('positive', 'Osmosis', 1)),
    Object.freeze(balance('nan', 'Osmosis', NaN)),
    Object.freeze(balance('infinity', 'Osmosis', Infinity)),
    Object.freeze(balance('negative-infinity', 'Osmosis', -Infinity)),
    Object.freeze(balance('zil', 'Zilliqa', -3)),
  ])
  const result = prepareBalances(source)
  assert.deepEqual(result, originalPipeline(source))
  assert.deepEqual(
    result.map((item) => item.id),
    ['zero', 'negative-infinity', 'eth', 'neo', 'zil'],
  )
  assert.equal(result[2].formatted, '-2')
  assert.equal(source[0].id, 'neo')
  assert.notEqual(result[2], source[1])
})

test('matches the repaired original across chains, amounts and input orders', () => {
  const chains = [
    'Osmosis',
    'Ethereum',
    'Arbitrum',
    'Zilliqa',
    'Neo',
    'Unknown',
    'toString',
    '__proto__',
  ]
  const amounts = [-Infinity, -999.99, -2.5, -0.1, -0, 0, 0.1, 2.5, Infinity, NaN]
  const source = chains.flatMap((chain, c) =>
    amounts.map((amount, a) => balance(`${c}-${a}`, chain, amount)),
  )
  for (let rotation = 0; rotation < source.length; rotation++) {
    const order = [...source.slice(rotation), ...source.slice(0, rotation)]
    assert.deepEqual(prepareBalances(order), originalPipeline(order))
    assert.deepEqual(
      prepareBalances([...order].reverse()),
      originalPipeline([...order].reverse()),
    )
  }
})

test('empty input and inherited object property names are unsupported', () => {
  assert.deepEqual(prepareBalances([]), [])
  assert.equal(getPriority('toString'), -99)
  assert.equal(getPriority('__proto__'), -99)
})

test('preserves original USD multiplication for valid, missing and non-finite quotes', () => {
  for (const amount of [-Infinity, -2.125, -0, 0, 2, Number.MAX_VALUE, NaN]) {
    for (const price of [undefined, NaN, Infinity, -1, 0, 0.123456, 10]) {
      assert.ok(Object.is(getUsdValue(amount, price), amount * price))
    }
  }
})
