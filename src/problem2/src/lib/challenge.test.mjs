import test from 'node:test'
import assert from 'node:assert/strict'
import { quoteSwap, formatUnits } from './swap-quote.ts'
import { parseLivePrices, parseSamplePrices } from './prices.ts'
import { makeTrace } from './sum-traces.ts'
import { buildDiffRows } from './diff-rows.ts'

test('swap uses decimal arithmetic and deducts the declared fee', () => {
  const quote = quoteSwap('0.1', 3, 2)
  assert.equal(quote.payUsd, '0.3')
  assert.equal(quote.feeUsd, '0.0009')
  assert.equal(quote.receive, '0.14955')
  assert.equal(quote.rate, '1.5')
})
test('swap rejects invalid amounts and quotes', () => {
  for (const input of [
    '',
    '-1',
    '0',
    'NaN',
    'Infinity',
    '1e3',
    '1,000',
    '1000000000001',
    '0.0000000000000000001',
  ])
    assert.throws(() => quoteSwap(input, 2, 1))
  for (const price of [0, -1, Infinity, NaN])
    assert.throws(() => quoteSwap('1', price, 1))
  assert.equal(quoteSwap('.5', 2, 1).receive, '0.997')
  assert.equal(formatUnits('0.0000000001'), '< 0.00000001')
})
test('price parsers exclude invalid data and take the latest sample per symbol', () => {
  const prices = parseLivePrices({
    ethereum: { usd: 100, last_updated_at: 1700000000 },
    'usd-coin': { usd: 1, last_updated_at: 1700000001 },
    cosmos: { usd: -1, last_updated_at: 1700000000 },
  })
  assert.equal(prices.ETH.usd, 100)
  assert.equal(prices.ATOM, undefined)
  assert.throws(() =>
    parseLivePrices({ ethereum: { usd: Infinity, last_updated_at: 1700000000 } }),
  )
  const samples = parseSamplePrices([
    { currency: 'ETH', price: 1, date: '2023-01-01' },
    { currency: 'ETH', price: 2, date: '2023-01-02' },
    { currency: 'USDC', price: 1, date: '2023-01-01' },
    { currency: 'WBTC', price: 3, date: 'invalid' },
  ])
  assert.equal(samples.ETH.usd, 2)
  assert.equal(samples.WBTC, undefined)
})
test('all animation traces finish at the actual mathematical result', () => {
  for (const method of ['a', 'b', 'c'])
    for (const n of [0, 1, 5, 12, 23, 134217727]) {
      const steps = makeTrace(method, n)
      assert.equal(steps.at(-1).value, Number((BigInt(n) * (BigInt(n) + 1n)) / 2n))
      assert.ok(steps.length <= 60)
    }
})
test('split diff preserves both source files and line numbers', () => {
  const before = 'one\ntwo\nthree\n',
    after = 'one\nnew\nextra\nthree\n'
  const rows = buildDiffRows(before, after)
  assert.equal(
    rows.flatMap((row) => (row.left ? [row.left.text] : [])).join('\n') + '\n',
    before,
  )
  assert.equal(
    rows.flatMap((row) => (row.right ? [row.right.text] : [])).join('\n') + '\n',
    after,
  )
  assert.deepEqual(
    rows.flatMap((row) => (row.right ? [row.right.number] : [])),
    [1, 2, 3, 4],
  )
})

test('review notes resolve uniquely to their exact source lines in the diff', async () => {
  const { readFile } = await import('node:fs/promises')
  const { originalNotes, componentNotes, helperNotes, indexReviewNotes } =
    await import('./refactor-notes.ts')
  const original = await readFile(
    new URL('../../../problem3/original.tsx.txt', import.meta.url),
    'utf8',
  )
  const component = await readFile(
    new URL('../../../problem3/WalletPage.tsx', import.meta.url),
    'utf8',
  )
  const helpers = await readFile(
    new URL('../../../problem3/balances.ts', import.meta.url),
    'utf8',
  )
  for (const [before, after, leftNotes, rightNotes] of [
    [original, component, originalNotes, componentNotes],
    ['', helpers, [], helperNotes],
  ]) {
    const rows = buildDiffRows(before, after)
    for (const [side, source, notes] of [
      ['left', before, leftNotes],
      ['right', after, rightNotes],
    ]) {
      const indexed = indexReviewNotes(source, notes)
      assert.equal(indexed.size, notes.length)
      for (const [number, note] of indexed) {
        const matches = rows.filter((row) => row[side]?.number === number)
        assert.equal(matches.length, 1)
        assert.equal(matches[0][side].text.trim(), note.anchor)
        // Unified view omits unchanged right lines; right notes must remain visible.
        if (side === 'right') assert.ok(!matches[0].left || matches[0].right.changed)
      }
    }
  }
})
