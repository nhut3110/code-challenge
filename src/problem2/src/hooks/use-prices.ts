import { useEffect, useState } from 'react'
import {
  parseLivePrices,
  parseSamplePrices,
  PRICE_URL,
  SAMPLE_URL,
  type Prices,
} from '../lib/prices'
export const usePrices = () => {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{
    prices: Prices
    source: 'live' | 'sample' | null
    loading: boolean
    error: string
  }>({ prices: {}, source: null, loading: true, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(12000)])
    // Keep the spinner visible briefly, even when the API responds immediately.
    let loadingTimer: ReturnType<typeof setTimeout>
    const minimumLoading = new Promise<void>((resolve) => {
      loadingTimer = setTimeout(resolve, 650)
    })
    const publish = async (next: typeof state) => {
      await minimumLoading
      if (!controller.signal.aborted) setState(next)
    }
    const load = async () => {
      setState((previous) => ({ ...previous, loading: true, error: '' }))
      try {
        const response = await fetch(PRICE_URL, { signal })
        if (!response.ok) throw new Error(`Price API returned ${response.status}.`)
        const prices = parseLivePrices(await response.json())
        await publish({ prices, source: 'live', loading: false, error: '' })
      } catch {
        if (controller.signal.aborted) return
        try {
          const response = await fetch(SAMPLE_URL, {
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
          })
          if (!response.ok) throw new Error('Sample unavailable.')
          const prices = parseSamplePrices(await response.json())
          await publish({
            prices,
            source: 'sample',
            loading: false,
            error:
              'Current quotes are unavailable. Using the challenge’s historical sample data.',
          })
        } catch {
          await publish({
            prices: {},
            source: null,
            loading: false,
            error: 'Could not load prices. Please retry.',
          })
        }
      }
    }
    void load()
    return () => {
      controller.abort()
      clearTimeout(loadingTimer)
    }
  }, [revision])
  return { ...state, refresh: () => setRevision((value) => value + 1) }
}
