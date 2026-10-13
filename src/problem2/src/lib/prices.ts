// CoinGecko uses IDs for requests; the UI uses token symbols.
export const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', id: 'wrapped-bitcoin' },
  { symbol: 'USDC', name: 'USD Coin', id: 'usd-coin' },
  { symbol: 'ATOM', name: 'Cosmos', id: 'cosmos' },
  { symbol: 'OSMO', name: 'Osmosis', id: 'osmosis' },
  { symbol: 'SWTH', name: 'Switcheo', id: 'switcheo' },
  { symbol: 'ZIL', name: 'Zilliqa', id: 'zilliqa' },
  { symbol: 'OKB', name: 'OKB', id: 'okb' },
] as const
export type Token = (typeof TOKENS)[number]
export interface Price {
  usd: number
  updatedAt: string
}
export type Prices = Record<string, Price | undefined>
export const PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${TOKENS.map((t) => t.id).join(',')}&vs_currencies=usd&include_last_updated_at=true`
export const SAMPLE_URL = 'https://interview.switcheo.com/prices.json'

// Read live quotes and skip tokens with invalid prices or timestamps.
export const parseLivePrices = (payload: unknown): Prices => {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid price response.')
  const result: Prices = {}
  const data = payload as Record<string, { usd?: unknown; last_updated_at?: unknown }>
  for (const token of TOKENS) {
    const quote = data[token.id]
    if (
      typeof quote?.usd !== 'number' ||
      !Number.isFinite(quote.usd) ||
      quote.usd <= 0 ||
      typeof quote.last_updated_at !== 'number' ||
      !Number.isFinite(quote.last_updated_at)
    )
      continue
    // CoinGecko timestamps are in seconds; JavaScript dates use milliseconds.
    const date = new Date(quote.last_updated_at * 1000)
    if (!Number.isFinite(date.getTime())) continue
    result[token.symbol] = { usd: quote.usd, updatedAt: date.toISOString() }
  }
  // A swap needs usable prices for at least two tokens.
  if (Object.keys(result).length < 2) throw new Error('Not enough usable token prices.')
  return result
}
// Read the historical fallback feed; these are not current market prices.
export const parseSamplePrices = (payload: unknown): Prices => {
  if (!Array.isArray(payload)) throw new Error('Invalid sample response.')
  const result: Prices = {}
  for (const row of payload) {
    if (
      !row ||
      typeof row.currency !== 'string' ||
      typeof row.price !== 'number' ||
      !Number.isFinite(row.price) ||
      row.price <= 0 ||
      typeof row.date !== 'string' ||
      !Number.isFinite(Date.parse(row.date))
    )
      continue
    if (!TOKENS.some((t) => t.symbol === row.currency)) continue
    // The sample may contain several quotes for one token. Keep the newest.
    if (
      !result[row.currency] ||
      Date.parse(row.date) > Date.parse(result[row.currency]!.updatedAt)
    )
      result[row.currency] = { usd: row.price, updatedAt: row.date }
  }
  // A swap needs usable prices for at least two tokens.
  if (Object.keys(result).length < 2) throw new Error('Not enough usable sample prices.')
  return result
}
