import { useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import { Check, Copy } from 'lucide-react'

export const Highlight = ({
  code,
  language = 'typescript',
}: {
  code: string
  language?: string
}) => {
  const render = (tokens: (string | Prism.Token)[]): React.ReactNode => {
    return tokens.map((token, index) =>
      typeof token === 'string' ? (
        token
      ) : (
        <span key={index} className={`token ${token.type}`}>
          {typeof token.content === 'string'
            ? token.content
            : render(Array.isArray(token.content) ? token.content : [token.content])}
        </span>
      ),
    )
  }
  return (
    <>
      {render(
        Prism.tokenize(code, Prism.languages[language] ?? Prism.languages.javascript),
      )}
    </>
  )
}
export const CodeBlock = ({
  code,
  filename,
  copyCode = code,
  language = 'javascript',
}: {
  code: string
  filename: string
  copyCode?: string
  language?: string
}) => {
  const [status, setStatus] = useState('Copy')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyCode)
      setStatus('Copied')
    } catch {
      setStatus('Copy failed')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus('Copy'), 2000)
  }
  return (
    <section className="code-window" aria-label={filename}>
      <div className="code-toolbar">
        <span>
          <span className="file-language">{language === 'javascript' ? 'JS' : 'TS'}</span>
          {filename}
        </span>
        <button type="button" onClick={copy} aria-label={`Copy ${filename}`}>
          {status === 'Copied' ? <Check size={14} /> : <Copy size={14} />}
          <span aria-live="polite">{status}</span>
        </button>
      </div>
      <pre>
        <code>
          {code
            .trimEnd()
            .split('\n')
            .map((line, i) => (
              <span className="code-line" key={i}>
                <span className="line-number" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <Highlight code={line} language={language} />
                </span>
              </span>
            ))}
        </code>
      </pre>
    </section>
  )
}
