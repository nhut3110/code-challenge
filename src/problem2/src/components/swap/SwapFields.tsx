import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ChevronDown } from 'lucide-react'
import type { Prices } from '../../lib/prices'
import { formatUnits } from '../../lib/swap-quote'
import { TokenLogo } from '../TokenLogo'
import { TokenPicker } from './TokenPicker'
import { useAssetSwap } from './use-asset-swap'
import { formatUsd } from './format-usd'

const CARD_HEIGHT = 150
const CARD_GAP = 4
const SWAP_HEIGHT = CARD_HEIGHT * 2 + CARD_GAP
const PICKER_HEIGHT = 420

interface SwapFieldsProps {
  swap: ReturnType<typeof useAssetSwap>
  prices: Prices
  loading: boolean
}

export const SwapFields = ({ swap, prices, loading }: SwapFieldsProps) => {
  const {
    available,
    coins,
    turns,
    pick,
    amount,
    search,
    status,
    triggers,
    payer,
    quote,
    error,
    resetStatus,
    close,
    choose,
    setPick,
    setSearch,
    setAmount,
    setTurns,
  } = swap
  const reduced = useReducedMotion()
  const grow = { type: 'spring' as const, duration: reduced ? 0 : 0.5, bounce: 0.08 }
  return (
    <motion.div
      className="swap-block"
      initial={false}
      animate={{ height: pick === null ? SWAP_HEIGHT : PICKER_HEIGHT }}
      transition={grow}
    >
      {coins.map((coin, slot) => {
        const isPickerOpen = pick === slot
        const isHidden = pick !== null && !isPickerOpen
        const role = slot === payer ? 'You pay' : 'You receive'
        return (
          <motion.div
            key={slot}
            className="swp-card"
            initial={false}
            animate={{
              top: isPickerOpen ? 0 : slot * (CARD_HEIGHT + CARD_GAP),
              height: isPickerOpen ? PICKER_HEIGHT : CARD_HEIGHT,
              scaleY: isHidden ? 0.02 : 1,
              opacity: isHidden ? 0 : 1,
            }}
            transition={grow}
            style={{
              zIndex: isPickerOpen ? 3 : 1,
              transformOrigin: slot === 0 ? '50% 0%' : '50% 100%',
            }}
          >
            <div
              className="swp-face"
              inert={pick !== null}
              style={{ visibility: isPickerOpen ? 'hidden' : 'visible' }}
            >
              <label
                className="swp-label"
                htmlFor={slot === payer ? 'swap-amount' : undefined}
              >
                {role}
              </label>
              <div className="swp-main-row">
                {slot === payer ? (
                  <input
                    id="swap-amount"
                    aria-label="Amount to pay"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      resetStatus()
                    }}
                    aria-invalid={!!error}
                    aria-describedby="swap-validation"
                    disabled={status === 'pending'}
                  />
                ) : (
                  <output aria-label="Amount to receive" title={quote?.receive}>
                    {quote ? formatUnits(quote.receive) : '—'}
                  </output>
                )}
                <button
                  ref={(element) => {
                    triggers.current[slot] = element
                  }}
                  type="button"
                  className="swp-coin"
                  onClick={() => {
                    setPick(slot)
                    setSearch('')
                  }}
                  disabled={loading || status === 'pending'}
                  aria-label={`Choose ${role.toLowerCase()} token: ${coin.symbol}`}
                >
                  <TokenLogo symbol={coin.symbol} />
                  {coin.symbol}
                  <ChevronDown className="select-chevron" size={16} />
                </button>
              </div>
              <span className="swp-fiat">
                {quote
                  ? formatUsd(slot === payer ? quote.payUsd : quote.receiveUsd)
                  : 'USD value unavailable'}
              </span>
            </div>
            <AnimatePresence>
              {isPickerOpen && (
                <TokenPicker
                  role={role}
                  selectedToken={coin}
                  tokens={available}
                  prices={prices}
                  search={search}
                  onSearchChange={setSearch}
                  onSelect={choose}
                  onClose={close}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
      <motion.button
        type="button"
        className="swp-flip"
        initial={false}
        animate={{
          rotate: turns * 180,
          opacity: pick === null ? 1 : 0,
          scale: pick === null ? 1 : 0.5,
        }}
        transition={{ type: 'spring', duration: reduced ? 0 : 0.6, bounce: 0.15 }}
        onClick={() => {
          if (quote) setAmount(quote.receive)
          setTurns((value) => value + 1)
          resetStatus()
        }}
        disabled={pick !== null || status === 'pending' || loading}
        aria-label="Reverse swap direction"
      >
        <ArrowDown size={19} />
      </motion.button>
    </motion.div>
  )
}
