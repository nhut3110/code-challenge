export type Method = 'a' | 'b' | 'c'
export interface TraceStep {
  label: string
  detail: string
  value: number
  cells: string[]
}
// Divide the even factor first to keep the intermediate result safely representable.
const triangular = (n: number) => (n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2))
// Build animation steps. The worker runs the actual solution separately.
export const makeTrace = (method: Method, n: number): TraceStep[] => {
  if (n === 0)
    return [
      {
        label: 'Empty sum',
        detail: 'No terms to add. Return 0.',
        value: 0,
        cells: ['0'],
      },
    ]
  if (method === 'a') {
    // Show at most 12 checkpoints so large inputs do not create huge animations.
    const count = Math.min(n, 12)
    return Array.from({ length: count }, (_, i) => {
      const previous = Math.floor((i * n) / count)
      const current = Math.floor(((i + 1) * n) / count)
      return {
        label: `Iteration ${current.toLocaleString()}`,
        detail:
          current - previous === 1
            ? `${triangular(previous)} + ${current} = ${triangular(current)}`
            : `Sampled checkpoint: add terms ${previous + 1} through ${current}.`,
        value: triangular(current),
        cells: [
          String(triangular(previous)),
          '+',
          current - previous === 1 ? String(current) : `${previous + 1}…${current}`,
          '=',
          String(triangular(current)),
        ],
      }
    })
  }
  // Explain the formula as pairing, dividing and multiplying.
  if (method === 'b') {
    const even = n % 2 === 0
    return [
      {
        label: 'Pair the endpoints',
        detail: `Every pair has the same total: 1 + ${n} = ${n + 1}.`,
        value: 0,
        cells: ['1', '+', String(n), '=', String(n + 1)],
      },
      {
        label: 'Divide the even factor first',
        detail: 'Avoid a larger intermediate product before division.',
        value: 0,
        cells: [
          even ? `${n} ÷ 2` : String(n),
          '×',
          even ? String(n + 1) : `${n + 1} ÷ 2`,
        ],
      },
      {
        label: 'Multiply once',
        detail: 'One closed-form calculation, independent of the number of terms.',
        value: triangular(n),
        cells: [
          String(even ? n / 2 : n),
          '×',
          String(even ? n + 1 : (n + 1) / 2),
          '=',
          String(triangular(n)),
        ],
      },
    ]
  }
  const steps: TraceStep[] = []
  const stack: number[] = []
  // Record the recursive calls as n is halved down to zero.
  for (let value = n; value > 0; value = Math.floor(value / 2)) {
    stack.push(value)
    steps.push({
      label: `Call S(${value})`,
      detail: `Reduce to S(${Math.floor(value / 2)}). Save this frame for the return.`,
      value: 0,
      cells: stack.map((v) => `S(${v})`),
    })
  }
  steps.push({
    label: 'Base case',
    detail: 'S(0) returns 0. Start unwinding the call stack.',
    value: 0,
    cells: ['S(0) = 0'],
  })
  // Replay the returns from the smallest call back to the original input.
  for (const value of stack.reverse()) {
    const half = Math.floor(value / 2),
      offset = value % 2 === 0 ? half : half + 1
    steps.push({
      label: `Return S(${value})`,
      detail: `2 × S(${half}) + ${offset}² = ${triangular(value)}.`,
      value: triangular(value),
      cells: [
        `2 × ${triangular(half)}`,
        '+',
        `${offset}²`,
        '=',
        String(triangular(value)),
      ],
    })
  }
  return steps
}
