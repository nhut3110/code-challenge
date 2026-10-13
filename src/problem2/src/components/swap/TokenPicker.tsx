import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Search, X } from 'lucide-react'
import type { Prices, Token } from '../../lib/prices'
import { TokenLogo } from '../TokenLogo'
import { formatUsd } from './format-usd'

interface TokenPickerProps {
  role: string
  selectedToken: Token
  tokens: Token[]
  prices: Prices
  search: string
  onSearchChange: (value: string) => void
  onSelect: (token: Token) => void
  onClose: () => void
}

export const TokenPicker = ({
  role,
  selectedToken,
  tokens,
  prices,
  search,
  onSearchChange,
  onSelect,
  onClose,
}: TokenPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null)
  const query = search.trim().toLowerCase()
  const filteredTokens = tokens.filter((token) =>
    `${token.symbol} ${token.name}`.toLowerCase().includes(query),
  )

  useEffect(() => {
    const timer = setTimeout(
      () => pickerRef.current?.querySelector<HTMLInputElement>('input')?.focus(),
      150,
    )
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      className="swp-picker"
      ref={pickerRef}
      role="dialog"
      aria-label={`${role}: choose a token`}
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        }
        if (event.key === 'Tab') {
          const elements = Array.from(
            pickerRef.current?.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input',
            ) ?? [],
          )
          const first = elements[0],
            last = elements[elements.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }
      }}
    >
      <div className="swp-pick-head">
        <h3>{role}</h3>
        <button type="button" aria-label="Close token picker" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="token-search">
        <Search size={16} />
        <input
          aria-label="Search tokens"
          placeholder="Search name or symbol"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="token-list">
        {filteredTokens.map((token) => (
          <button
            type="button"
            key={token.symbol}
            className={`swp-pick-row ${selectedToken.symbol === token.symbol ? 'selected' : ''}`}
            aria-pressed={selectedToken.symbol === token.symbol}
            onClick={() => onSelect(token)}
          >
            <TokenLogo symbol={token.symbol} />
            <span>
              <b>{token.symbol}</b>
              <small>{token.name}</small>
            </span>
            <span className="picker-price">{formatUsd(prices[token.symbol]!.usd)}</span>
            <span className="picker-check">
              {selectedToken.symbol === token.symbol && <Check size={16} />}
            </span>
          </button>
        ))}
        {filteredTokens.length === 0 && (
          <p className="picker-empty">No matching tokens.</p>
        )}
      </div>
    </motion.div>
  )
}
