import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from '../../../problem1/sum-to-n.js'
const functions = { a: sum_to_n_a, b: sum_to_n_b, c: sum_to_n_c }
self.onmessage = (event: MessageEvent<{ method: keyof typeof functions; n: number }>) => {
  try {
    const start = performance.now()
    const result = functions[event.data.method](event.data.n)
    self.postMessage({ result, duration: performance.now() - start })
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Calculation failed.',
    })
  }
}
