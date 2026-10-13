// Largest non-negative integer whose triangular sum is a safe JS integer.
export const MAX_N = 134_217_727

const assertInput = (n) => {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_N) {
    throw new RangeError(`n must be an integer between 0 and ${MAX_N}.`)
  }
}

// Iteration: O(n) time, O(1) extra space.
export const sum_to_n_a = (n) => {
  assertInput(n)
  let sum = 0
  for (let i = 1; i <= n; i += 1) sum += i
  return sum
}

// Arithmetic formula: O(1) time and space. Divide the even factor first,
// keeping the multiplication result within the safe-integer range.
export const sum_to_n_b = (n) => {
  assertInput(n)
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2)
}

// Recursive halving: O(log n) time and stack space, without a linear-depth
// call stack. S(2m) = 2*S(m) + m*m; S(2m+1) = 2*S(m) + (m+1)*(m+1).
export const sum_to_n_c = (n) => {
  assertInput(n)
  const sumByHalving = (value) => {
    if (value === 0) return 0
    const half = Math.floor(value / 2)
    const offset = value % 2 === 0 ? half : half + 1
    return 2 * sumByHalving(half) + offset * offset
  }
  return sumByHalving(n)
}
