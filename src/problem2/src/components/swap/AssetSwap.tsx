import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Prices } from '../../lib/prices'
import { formatUnits } from '../../lib/swap-quote'
import { SwapVerification } from './SwapVerification'
import { SwapFields } from './SwapFields'
import { useAssetSwap } from './use-asset-swap'
import { formatUsd } from './format-usd'

interface AssetSwapProps {
  prices: Prices
  loading: boolean
}

export const AssetSwap = ({ prices, loading }: AssetSwapProps) => {
  const swap = useAssetSwap(prices, loading)
  const { pay, receive, quote, error, status, pick, confirm } = swap
  const reduced = useReducedMotion()
  const verification = status !== 'idle'
  return (
    <div className="swap-flow">
      <AnimatePresence mode="wait" initial={false}>
        {verification ? (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -14 }}
            transition={{ duration: reduced ? 0 : 0.24 }}
          >
            <SwapVerification
              status={status}
              onVerify={swap.verify}
              onBack={swap.resetStatus}
            />
          </motion.div>
        ) : (
          <motion.form
            key="swap"
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -14 }}
            transition={{ duration: reduced ? 0 : 0.24 }}
            className="swap-form"
            onSubmit={(event) => {
              event.preventDefault()
              confirm()
            }}
          >
            <SwapFields swap={swap} prices={prices} loading={loading} />
            <div className="swap-details">
              <span>Exchange rate</span>
              <strong>
                {quote
                  ? `1 ${pay.symbol} = ${formatUnits(quote.rate)} ${receive.symbol}`
                  : '—'}
              </strong>
              <span>Demo fee · 0.3%</span>
              <strong>{quote ? formatUsd(quote.feeUsd) : '—'}</strong>
            </div>
            <p
              id="swap-validation"
              className={error ? 'error-message' : 'swap-help'}
              aria-live="polite"
            >
              {error || 'Output includes the fee.'}
            </p>
            <button
              className="primary-button swap-confirm"
              type="submit"
              disabled={!quote || loading || pick !== null}
            >
              Confirm demo swap <ArrowRight size={18} />
            </button>
            <p className="micro-note swap-disclaimer">
              Demo only. No assets transferred.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
