import { useMemo, type ComponentType, type HTMLAttributes } from 'react'
import {
  getUsdValue,
  prepareBalances,
  type PriceMap,
  type WalletBalance,
} from './balances'

export interface WalletRowProps {
  className?: string
  amount: number
  usdValue: number
  formattedAmount: string
}

export interface WalletPageProps extends HTMLAttributes<HTMLDivElement> {
  balances: readonly WalletBalance[]
  prices: PriceMap
  rowComponent: ComponentType<WalletRowProps>
  rowClassName?: string
}

export const WalletPage = ({
  balances,
  prices,
  rowComponent: WalletRow,
  rowClassName,
  children: _children,
  ...rest
}: WalletPageProps) => {
  const displayBalances = useMemo(() => prepareBalances(balances), [balances])

  return (
    <div {...rest}>
      {displayBalances.map((balance) => (
        <WalletRow
          key={balance.id}
          className={rowClassName}
          amount={balance.amount}
          usdValue={getUsdValue(balance.amount, prices[balance.currency])}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  )
}
