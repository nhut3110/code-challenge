# Problem 3 — React refactor

The solution keeps React, TypeScript, functional components and Hooks. The issues and improvements are documented below and attached to their exact source lines in the preview.

## Issues and improvements

| Original code                                                  | Issue                                                                             | Refactor and reason                                                                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `WalletBalance`                                                | `blockchain` is read but missing from the type.                                   | Declare it so filtering and sorting are checked by TypeScript.                                                                       |
| `getPriority(blockchain: any)`                                 | `any` bypasses checking; the pure function is recreated each render.              | Use a typed helper and a shared priority lookup. Function allocation is small; repeated list processing is the more meaningful cost. |
| `if (lhsPriority > -99)`                                       | Undefined variable: filtering a non-empty list throws.                            | Use the current balance's priority.                                                                                                  |
| `[balances, prices]`                                           | A new prices reference unnecessarily repeats filtering and sorting.               | Memoize preparation by balances only. USD values still use current prices during render.                                             |
| `formattedBalances = sortedBalances.map(...)`                  | An unused array and formatting pass are created every render.                     | Include formatting in the balance memo and render its result.                                                                        |
| `sortedBalances.map((balance: FormattedWalletBalance) => ...)` | The array has no formatted field; the callback annotation cannot add it.          | Pass prepared balances to rows, fixing undefined `formattedAmount`.                                                                  |
| `key={index}`                                                  | Insertion, removal or sorting can attach existing row state to another balance.   | Require a unique, stable ID from the data source.                                                                                    |
| Sort comparator                                                | Equal priorities implicitly return `undefined`, which JavaScript treats as a tie. | Return zero explicitly via the priority difference. This clarifies the same stable order, not a correctness fix.                     |

Preparation still takes O(n + k log k) time for n input balances and k retained balances, with O(n) worst-case extra space. Memoization avoids repeating preparation when only prices change; it does not improve the initial sort's complexity. Balance updates must provide a new array reference, as with the original memo.

## Behavior preserved

The prompt does not explain why the filter uses `amount <= 0`. This refactor keeps that rule, the chain priorities, descending order, stable order for ties, default `toFixed()` precision and currency-based USD multiplication. It does not add positive-balance filtering, custom rounding, price fallback values or children rendering.

Missing prices still produce `NaN`, as in the original. Changing that behavior requires a product decision about unavailable valuations; it is not silently changed in this refactor. The original sort does not mutate the input because filter creates a new array first.

Two defects are corrected: the undefined filter variable and passing unformatted balances to rows. Tests compare the refactor against the original pipeline with these defects corrected.

## Integration

The original hooks, `WalletRow`, `classes` and `BoxProps` were not supplied. `WalletPage.tsx` accepts hook results as data props and the existing row component/class as props; the host can pass its `useWalletBalances()` and `usePrices()` results. A stable, unique balance ID must come from the data source. The root uses div attributes because it renders a div. This is an explicit integration boundary, not a drop-in replacement for the missing project dependencies.

`balances.ts` holds the helpers. The preview compares both files in split or unified view. Notes sit directly below the relevant source line and distinguish bugs, efficiency, conventions, preserved behavior and integration choices.

Run from the repository root:

```sh
node --test src/problem3/balances.test.mjs
```
