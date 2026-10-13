import { RefreshCw } from 'lucide-react'
import { PageHeading } from '../components/PageHeading'
import { AssetSwap } from '../components/swap/AssetSwap'
import { TokenLogo } from '../components/TokenLogo'
import { usePrices } from '../hooks/use-prices'
import { TOKENS } from '../lib/prices'
export const SwapPage = () => {
  const { prices, source, loading, error, refresh } = usePrices()
  const dates = Object.values(prices).flatMap((quote) =>
    quote ? [Date.parse(quote.updatedAt)] : [],
  )
  const oldest = dates.length ? new Date(Math.min(...dates)) : null
  return (
    <div className="page">
      <PageHeading
        number="02"
        title="Token swap"
        description="Choose a pair and enter an amount."
      />
      <div className="swap-layout">
        <section className="swap-workspace">
          <AssetSwap prices={prices} loading={loading} />
        </section>
        <aside className="market-panel">
          <div className="market-heading">
            <div>
              <h2>Market quotes</h2>
            </div>
            <button
              type="button"
              className="icon-button refresh-button"
              aria-label="Refresh prices"
              aria-busy={loading}
              disabled={loading}
              onClick={refresh}
            >
              <RefreshCw size={17} className={loading ? 'spin' : ''} />
            </button>
          </div>
          <div className={`price-source ${source === 'sample' ? 'sample-source' : ''}`}>
            <span className="status-dot" />
            {loading
              ? 'Fetching quotes…'
              : source === 'live'
                ? 'CoinGecko · USD quotes'
                : source === 'sample'
                  ? 'Historical challenge sample'
                  : 'Quotes unavailable'}
          </div>
          {error && (
            <p role={source ? 'status' : 'alert'} className="price-warning">
              {error}
            </p>
          )}
          {loading && !dates.length ? (
            <div className="quote-skeleton" aria-label="Loading token prices">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} />
              ))}
            </div>
          ) : (
            <ul className="market-list">
              {TOKENS.filter((token) => prices[token.symbol]).map((token) => (
                <li key={token.symbol}>
                  <TokenLogo symbol={token.symbol} />
                  <span>
                    <b>{token.symbol}</b>
                    <small>{token.name}</small>
                  </span>
                  <strong>
                    {prices[token.symbol]!.usd.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: prices[token.symbol]!.usd < 1 ? 8 : 2,
                    })}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          {!loading && !dates.length && (
            <button type="button" className="secondary-button" onClick={refresh}>
              Retry loading prices
            </button>
          )}
          <p className="quote-date">
            {oldest
              ? `Oldest quote: ${oldest.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
              : ''}
          </p>
        </aside>
      </div>
    </div>
  )
}
