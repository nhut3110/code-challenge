import source from '../../../problem1/sum-to-n.js?raw'
import { PageHeading } from '../components/PageHeading'
import { CodeBlock } from '../components/CodeBlock'
import { SumPlayground } from '../components/SumPlayground'
import type { Method } from '../lib/sum-traces'
const methods: {
  id: Method
  name: string
  time: string
  space: string
  description: string
}[] = [
  {
    id: 'a',
    name: 'Iterative accumulation',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Visit each integer once. Add it to a running total.',
  },
  {
    id: 'b',
    name: 'Arithmetic series',
    time: 'O(1)',
    space: 'O(1)',
    description: 'Pair the endpoints and calculate the sum directly.',
  },
  {
    id: 'c',
    name: 'Recursive halving',
    time: 'O(log n)',
    space: 'O(log n)',
    description: 'Halve the problem, then rebuild the sum as the stack unwinds.',
  },
]
const extract = (id: Method) => {
  const start = source.indexOf(`export const sum_to_n_${id}`)
  const end = source.indexOf('\n//', start)
  return source.slice(start, end === -1 ? undefined : end).trim()
}
const sharedValidation = source.slice(0, source.indexOf('// Iteration:')).trim()

export const SumPage = () => {
  return (
    <div className="page">
      <PageHeading
        number="01"
        title="Sum to n"
        description="Three solutions with interactive examples."
      />
      <div className="contract-strip">
        <code>S(n) = 1 + 2 + … + n</code>
        <span>n: 0–134,217,727 · S(0) = 0</span>
      </div>
      {methods.map((method, i) => (
        <article key={method.id} className="method-section">
          <div className="method-heading">
            <div>
              <span className="section-index">0{i + 1}</span>
              <h2>{method.name}</h2>
            </div>
            <div className="complexities">
              <span>
                TIME <b>{method.time}</b>
              </span>
              <span>
                SPACE <b>{method.space}</b>
              </span>
            </div>
          </div>
          <p className="section-description">{method.description}</p>
          <div className="method-grid">
            <CodeBlock
              filename={`sum_to_n_${method.id}.js`}
              code={extract(method.id)}
              copyCode={`${sharedValidation}\n\n${extract(method.id)}`}
            />
            <SumPlayground method={method.id} />
          </div>
        </article>
      ))}
    </div>
  )
}
