import Decimal from 'decimal.js'
// Decimal arithmetic avoids floating-point rounding errors in the quote.
const Money = Decimal.clone({ precision: 40 })
export const FEE_RATE = 0.003
export interface SwapQuote {
  receive: string
  rate: string
  payUsd: string
  receiveUsd: string
  feeUsd: string
}
// Convert the pay amount to USD, subtract the demo fee, then convert to the receive token.
export const quoteSwap = (
  amount: string,
  payPrice: number,
  receivePrice: number,
): SwapQuote => {
  // Accept plain decimal input and limit its size and precision.
  if (
    amount.length > 36 ||
    !/^(?:\d+\.?\d*|\.\d+)$/.test(amount) ||
    (amount.split('.')[1]?.length ?? 0) > 18
  )
    throw new Error('Enter a valid amount with up to 18 decimal places.')
  const value = new Money(amount)
  if (!value.gt(0) || value.gt('1000000000000'))
    throw new Error('Amount must be greater than 0 and at most 1 trillion.')
  if (![payPrice, receivePrice].every((price) => Number.isFinite(price) && price > 0))
    throw new Error('Prices are unavailable for this pair.')
  const payUsd = value.times(payPrice),
    feeUsd = payUsd.times(FEE_RATE),
    receiveUsd = payUsd.minus(feeUsd)
  // Round down to 18 decimal places so the quote never promises extra units.
  const receive = receiveUsd
    .div(receivePrice)
    .toFixed(18, Decimal.ROUND_DOWN)
    .replace(/\.?0+$/, '')
  if (!new Money(receive).gt(0))
    throw new Error('Amount is too small for the output precision. Increase the amount.')
  return {
    receive,
    rate: new Money(payPrice).div(receivePrice).toString(),
    payUsd: payUsd.toString(),
    receiveUsd: receiveUsd.toString(),
    feeUsd: feeUsd.toString(),
  }
}
// Format for display only; calculations keep the full decimal value.
export const formatUnits = (value: string, max = 8): string => {
  const number = new Money(value)
  // Show a small-value hint instead of rounding a positive amount to zero.
  if (number.gt(0) && number.lt(new Money(10).pow(-max)))
    return `< ${new Money(10).pow(-max).toFixed(max)}`
  if (number.gte('1000000000000')) return number.toExponential(4)
  return number.toNumber().toLocaleString('en-US', { maximumFractionDigits: max })
}
