# Problem 1 — Sum to n

Three functions in `sum-to-n.js` calculate the sum from 1 to n:

| Function     | Approach                          | Time     | Space    |
| ------------ | --------------------------------- | -------- | -------- |
| `sum_to_n_a` | Add each number in a loop         | O(n)     | O(1)     |
| `sum_to_n_b` | Use n × (n + 1) / 2               | O(1)     | O(1)     |
| `sum_to_n_c` | Split the sum in half recursively | O(log n) | O(log n) |

Inputs must be integers from 0 to 134,217,727. Zero returns zero; negative numbers are rejected. The upper limit keeps the result within JavaScript's safe integer range.

The formula is the fastest option. The recursive version halves n at each step instead of making one call per number.

Try all three on the website. Large loop animations show selected steps, while the calculation still runs in full.

Run tests from the repository root:

```sh
node --test src/problem1/sum-to-n.test.mjs
```
