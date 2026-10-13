import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, Check, LoaderCircle } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface SwapVerificationProps {
  status: 'code' | 'pending' | 'success'
  onVerify: (code: string) => void
  onBack: () => void
}

export const SwapVerification = ({ status, onVerify, onBack }: SwapVerificationProps) => {
  const [code, setCode] = useState('')
  const [focused, setFocused] = useState(false)
  const [seconds, setSeconds] = useState(10)
  const back = useRef(onBack)
  useEffect(() => {
    back.current = onBack
  }, [onBack])
  useEffect(() => {
    if (status !== 'success') return
    const deadline = Date.now() + 10000
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSeconds(remaining)
      if (!remaining) {
        clearInterval(timer)
        back.current()
      }
    }, 200)
    return () => clearInterval(timer)
  }, [status])
  const input = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const filterId = `otp-goo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const merged = status !== 'code'
  const checking = code.length === 4 && !merged
  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 180, damping: 15, mass: 0.8 }
  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    if (code.length !== 4 || status !== 'code') return
    const timer = setTimeout(() => onVerify(code), reduced ? 0 : 450)
    return () => clearTimeout(timer)
  }, [code, status, onVerify, reduced])
  return (
    <section
      className={`swap-verification ${status === 'success' ? 'is-complete' : ''}`}
      aria-label="Demo swap confirmation"
    >
      <div className="verification-copy" aria-live="polite">
        <span className="verification-eyebrow">
          {status === 'success' ? 'ALL SET' : 'ONE LAST STEP'}
        </span>
        <h2>{status === 'success' ? 'Swap complete' : 'Confirm your swap'}</h2>
        <p>
          {status === 'success'
            ? 'Your demo swap was successful.'
            : 'Enter any 4 digits to try the demo.'}
        </p>
      </div>
      <div className="verification-stage">
        <div className="liquid-otp">
          <svg width="0" height="0" aria-hidden="true">
            <defs>
              <filter
                id={filterId}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -12"
                />
              </filter>
            </defs>
          </svg>
          <div
            className="liquid-shapes"
            style={{ filter: reduced ? undefined : `url(#${filterId})` }}
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((index) => (
              <motion.span
                key={index}
                className="liquid-cell"
                animate={{
                  x: merged ? 81 : index * 54,
                  borderRadius: merged ? 24 : 12,
                  scale: checking && !reduced ? [1, 0.94, 1] : 1,
                }}
                transition={{
                  ...spring,
                  scale: {
                    duration: 0.6,
                    repeat: checking ? Infinity : 0,
                    delay: index * 0.07,
                  },
                }}
              />
            ))}
            <motion.span
              className="liquid-capsule"
              initial={false}
              animate={{ width: merged ? 164 : 0, opacity: merged ? 1 : 0 }}
              transition={spring}
            />
          </div>
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="liquid-slot"
              aria-hidden="true"
              animate={{ x: merged ? 81 : index * 54, opacity: merged ? 0 : 1 }}
              transition={{ ...spring, opacity: { duration: 0.15 } }}
            >
              <AnimatePresence mode="popLayout">
                {code[index] && (
                  <motion.span
                    key={`${index}-${code[index]}`}
                    className="liquid-digit"
                    initial={{
                      y: reduced ? 0 : 18,
                      scale: reduced ? 1 : 0.86,
                      opacity: 0,
                      filter: reduced ? 'none' : 'blur(3px)',
                    }}
                    animate={{ y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: reduced ? 0 : -12, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.22 }}
                  >
                    {code[index]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          ))}
          <motion.i
            className="liquid-caret"
            aria-hidden="true"
            animate={{
              x: Math.min(code.length, 3) * 54 + 23,
              opacity: focused && code.length < 4 && !merged ? 1 : 0,
            }}
            transition={spring}
          />
          <motion.div
            className="liquid-answer"
            role="status"
            aria-hidden={!merged}
            initial={false}
            animate={{ opacity: merged ? 1 : 0, scale: merged ? 1 : 0.9 }}
            transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : 0.28 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                transition={{ duration: 0.16 }}
              >
                {status === 'success' ? (
                  <>
                    <Check size={17} /> Done
                  </>
                ) : (
                  <>
                    <LoaderCircle size={17} className="spin" /> Swapping
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.div>
          <input
            ref={input}
            className="liquid-input"
            aria-label="4-digit demo code"
            aria-describedby="demo-code-note"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={code}
            disabled={merged}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 4))
            }
          />
        </div>
      </div>
      <span id="demo-code-note" className="micro-note">
        {status === 'success'
          ? `Returning to swap in ${seconds}s`
          : 'Try 1234 · No real verification or transfer.'}
      </span>
      <button type="button" className="verification-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to swap
      </button>
    </section>
  )
}
