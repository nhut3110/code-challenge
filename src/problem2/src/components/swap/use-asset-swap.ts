import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { TOKENS, type Prices, type Token } from '../../lib/prices'
import { formatUnits, quoteSwap, type SwapQuote } from '../../lib/swap-quote'

export const useAssetSwap = (prices: Prices, loading: boolean) => {
  const available = TOKENS.filter((token) => prices[token.symbol])
  const [coins, setCoins] = useState<[Token, Token]>([TOKENS[0], TOKENS[2]])
  const [turns, setTurns] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [amount, setAmount] = useState('1')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'idle' | 'code' | 'pending' | 'success'>('idle')
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const summaryRef = useRef('')
  const payer = turns % 2
  const pay = coins[payer]
  const receive = coins[1 - payer]
  const payPrice = prices[pay.symbol]?.usd
  const receivePrice = prices[receive.symbol]?.usd
  let quote: SwapQuote | null = null
  let error = ''
  if (payPrice !== undefined && receivePrice !== undefined) {
    try {
      quote = quoteSwap(amount, payPrice, receivePrice)
    } catch (problem) {
      error = (problem as Error).message
    }
  } else if (!loading) error = 'Choose two tokens with available prices.'
  useEffect(() => () => clearTimeout(timer.current), [])
  const resetStatus = () => {
    clearTimeout(timer.current)
    setStatus('idle')
  }
  const close = () => {
    const slot = pick
    setPick(null)
    setSearch('')
    if (slot !== null) requestAnimationFrame(() => triggers.current[slot]?.focus())
  }
  const choose = (token: Token) => {
    if (pick === null) return
    const slot = pick
    const other = 1 - slot
    setCoins((previous) => {
      const next: [Token, Token] = [...previous]
      if (next[other].symbol === token.symbol) next[other] = previous[slot]
      next[slot] = token
      return next
    })
    resetStatus()
    close()
  }
  const confirm = () => {
    if (!quote || loading || pick !== null || status === 'pending') return
    summaryRef.current = `${formatUnits(amount)} ${pay.symbol} → ${formatUnits(quote.receive)} ${receive.symbol}`
    setStatus('code')
  }
  const verify = (code: string) => {
    if (status !== 'code' || !/^\d{4}$/.test(code)) return
    setStatus('pending')
    timer.current = setTimeout(() => {
      setStatus('success')
      toast.success('Demo swap complete', { description: summaryRef.current })
    }, 1500)
  }
  return {
    available,
    coins,
    turns,
    pick,
    amount,
    search,
    status,
    triggers,
    payer,
    pay,
    receive,
    quote,
    error,
    resetStatus,
    close,
    choose,
    confirm,
    verify,
    setPick,
    setSearch,
    setAmount,
    setTurns,
  }
}
