export interface WalletBalance {
  // Stable identity supplied by the wallet data source, not a render index.
  id: string
  currency: string
  blockchain: string
  amount: number
}

export interface DisplayWalletBalance extends WalletBalance {
  formatted: string
}

export type PriceMap = Readonly<Record<string, number | undefined>>

const PRIORITIES: Readonly<Record<string, number | undefined>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
}

// Higher values appear first. Unknown chains receive the unsupported fallback.
export const getPriority = (blockchain: string): number => {
  return Object.hasOwn(PRIORITIES, blockchain) ? (PRIORITIES[blockchain] ?? -99) : -99
}

// Input is never mutated; equal-priority balances keep source order.
export const prepareBalances = (
  balances: readonly WalletBalance[],
): DisplayWalletBalance[] => {
  // Preserve the original non-positive balance rule and default display precision.
  return balances
    .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount <= 0)
    .sort((left, right) => getPriority(right.blockchain) - getPriority(left.blockchain))
    .map((balance) => ({ ...balance, formatted: balance.amount.toFixed() }))
}

// Preserve the original multiplication, including NaN for a missing quote.
export const getUsdValue = (amount: number, price: number | undefined): number => {
  return amount * (price ?? Number.NaN)
}
