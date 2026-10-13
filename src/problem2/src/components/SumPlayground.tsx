import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import { MAX_N } from '../../../problem1/sum-to-n.js'
import { makeTrace, type Method, type TraceStep } from '../lib/sum-traces'

export const SumPlayground = ({ method }: { method: Method }) => {
  const [input, setInput] = useState('5'),
    [error, setError] = useState('')
  const [steps, setSteps] = useState<TraceStep[]>([]),
    [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false)
  const [result, setResult] = useState<number | null>(null),
    [duration, setDuration] = useState(0)
  const worker = useRef<Worker | null>(null)
  const reduced = useReducedMotion()
  useEffect(() => () => worker.current?.terminate(), [])
  useEffect(() => {
    if (!playing) return
    if (index >= steps.length - 1) return
    const timer = setTimeout(() => setIndex((value) => value + 1), 750)
    return () => clearTimeout(timer)
  }, [playing, index, steps.length])
  const complete = steps.length > 0 && index === steps.length - 1
  const run = () => {
    worker.current?.terminate()
    const n = Number(input)
    if (!/^\d+$/.test(input.trim()) || !Number.isSafeInteger(n) || n > MAX_N) {
      setBusy(false)
      setPlaying(false)
      setSteps([])
      setResult(null)
      setError(`Enter a whole number from 0 to ${MAX_N.toLocaleString()}.`)
      return
    }
    setError('')
    setResult(null)
    setBusy(true)
    setIndex(0)
    const trace = makeTrace(method, n)
    setSteps(trace)
    setPlaying(!reduced)
    if (reduced) setIndex(trace.length - 1)
    const instance = new Worker(new URL('../workers/sum.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.current = instance
    instance.onmessage = ({ data }) => {
      setBusy(false)
      if (data.error) setError(data.error)
      else {
        setResult(data.result)
        setDuration(data.duration)
      }
      instance.terminate()
    }
    instance.onerror = () => {
      setBusy(false)
      setError('Could not run the calculation. Try again.')
      instance.terminate()
    }
    instance.postMessage({ method, n })
  }
  const step = steps[index]
  return (
    <section className="playground" aria-label={`Playground method ${method}`}>
      <div className="panel-label">Playground</div>
      <form
        className="run-form"
        onSubmit={(e) => {
          e.preventDefault()
          run()
        }}
      >
        <label htmlFor={`input-${method}`}>
          Input <code>n</code>
        </label>
        <div className="input-action">
          <input
            id={`input-${method}`}
            inputMode="numeric"
            value={input}
            onChange={(e) => {
              worker.current?.terminate()
              setInput(e.target.value)
              setError('')
              setBusy(false)
              setPlaying(false)
              setSteps([])
              setResult(null)
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `error-${method}` : undefined}
          />
          <button className="primary-button" type="submit">
            <Play size={14} />
            {busy ? 'Restart' : 'Run'}
          </button>
        </div>
      </form>
      {error && (
        <p id={`error-${method}`} role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="trace-stage">
        {!step ? (
          <div className="trace-empty">
            <span className="empty-equation">1 + 2 + … + n</span>
            <p>Enter n and run.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${steps.length}`}
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: reduced ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="trace-cells">
                {step.cells.map((cell, i) => (
                  <span
                    key={i}
                    className={['+', '×', '='].includes(cell) ? 'operator' : 'trace-cell'}
                  >
                    {cell}
                  </span>
                ))}
              </div>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      {steps.length > 0 && (
        <>
          <div className="trace-controls">
            <button
              type="button"
              aria-label={playing && !complete ? 'Pause animation' : 'Play animation'}
              onClick={() => {
                if (complete) setIndex(0)
                setPlaying((p) => complete || !p)
              }}
            >
              {playing && !complete ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              type="button"
              aria-label="Restart animation"
              onClick={() => {
                setIndex(0)
                setPlaying(false)
              }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              aria-label="Next step"
              disabled={complete}
              onClick={() => {
                setPlaying(false)
                setIndex((i) => Math.min(i + 1, steps.length - 1))
              }}
            >
              <ChevronRight size={16} />
            </button>
            <span>
              Step {index + 1} / {steps.length}
            </span>
          </div>
          <div className="trace-progress">
            <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
          </div>
        </>
      )}
      <div className="result-row" aria-live="polite">
        <span>Result</span>
        <strong>
          {busy ? 'Computing…' : result === null ? '—' : result.toLocaleString()}
        </strong>
        {result !== null && (
          <small>
            {duration < 0.001 ? '< 0.001' : duration.toFixed(3)} ms · worker execution
          </small>
        )}
      </div>
    </section>
  )
}
