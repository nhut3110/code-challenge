export interface ReviewNote {
  anchor: string
  kind: 'Bug' | 'Efficiency' | 'Convention' | 'Preserved' | 'Integration'
  title: string
  body: string
}

export const originalNotes: ReviewNote[] = [
  {
    anchor: 'interface WalletBalance {',
    kind: 'Bug',
    title: 'Incomplete balance type',
    body: 'The code reads blockchain, but this interface does not declare it. Add the field to match the data used by the filter and sort.',
  },
  {
    anchor: 'const getPriority = (blockchain: any): number => {',
    kind: 'Convention',
    title: 'Use a typed, shared priority helper',
    body: 'any bypasses type checking. Moving this pure helper outside the component avoids recreating it on every render; the allocation is small, not the main performance cost.',
  },
  {
    anchor: 'if (lhsPriority > -99) {',
    kind: 'Bug',
    title: 'Undefined filter variable',
    body: 'lhsPriority is not defined here. Use the computed balancePriority; otherwise filtering a non-empty list throws.',
  },
  {
    anchor: 'if (balance.amount <= 0) {',
    kind: 'Preserved',
    title: 'Keep the original amount rule',
    body: 'This selects zero and negative balances. The prompt gives no business reason to invert it, so the refactor keeps <= 0.',
  },
  {
    anchor: '}, [balances, prices]);',
    kind: 'Efficiency',
    title: 'Remove the unrelated price dependency',
    body: 'A new prices reference reruns filtering and sorting, although neither reads prices. Memoize by balances only; calculate USD with current prices during render.',
  },
  {
    anchor: 'const formattedBalances = sortedBalances.map((balance: WalletBalance) => {',
    kind: 'Efficiency',
    title: 'Unused formatting work',
    body: 'This creates an unused array and formats every balance on each render. Move formatting into the balances memo and render that result.',
  },
  {
    anchor:
      'const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {',
    kind: 'Bug',
    title: 'A type annotation does not add formatted data',
    body: 'sortedBalances has no formatted field. Read the formatted result instead; annotating the callback as FormattedWalletBalance cannot create the missing property.',
  },
  {
    anchor: 'const usdValue = prices[balance.currency] * balance.amount;',
    kind: 'Preserved',
    title: 'Missing quotes remain an explicit limitation',
    body: 'An absent price produces NaN. The refactor preserves this arithmetic rather than inventing a zero or fallback valuation; unavailable-price UX needs a separate product decision.',
  },
  {
    anchor: 'key={index}',
    kind: 'Convention',
    title: 'Use stable data identity',
    body: 'Index keys can associate row state with another balance after sorting or insertion. Use a unique ID from the data source, not a generated render index.',
  },
]

export const componentNotes: ReviewNote[] = [
  {
    anchor: 'rowComponent: ComponentType<WalletRowProps>',
    kind: 'Integration',
    title: 'Keep the existing row component',
    body: 'The prompt omits WalletRow and the hooks. Accept the host row component and hook results explicitly instead of replacing the row UI or inventing hook behavior.',
  },
  {
    anchor: 'children: _children,',
    kind: 'Preserved',
    title: 'Do not add children rendering',
    body: 'The original extracts children but never renders it. Destructure it out of the div props to retain that behavior.',
  },
  {
    anchor:
      'const displayBalances = useMemo(() => prepareBalances(balances), [balances])',
    kind: 'Efficiency',
    title: 'One memoized preparation pipeline',
    body: 'Filtering, sorting and formatting depend only on balances. They run when its reference changes; the source array is not mutated. Data updates must provide a new array reference.',
  },
  {
    anchor: 'key={balance.id}',
    kind: 'Convention',
    title: 'Stable row keys',
    body: 'The data source must supply unique, stable IDs. This preserves row identity when the visible order changes.',
  },
  {
    anchor: 'formattedAmount={balance.formatted}',
    kind: 'Bug',
    title: 'Pass the prepared display amount',
    body: 'The row now receives the formatted value instead of undefined. The original default toFixed() precision is retained.',
  },
]

export const helperNotes: ReviewNote[] = [
  {
    anchor:
      'return Object.hasOwn(PRIORITIES, blockchain) ? (PRIORITIES[blockchain] ?? -99) : -99',
    kind: 'Convention',
    title: 'Preserve the switch fallback',
    body: 'Only own lookup entries count as supported chains. Names such as toString must still return -99, matching the original switch.',
  },
  {
    anchor:
      '.filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount <= 0)',
    kind: 'Preserved',
    title: 'Same supported-chain and amount rules',
    body: 'This corrects the undefined variable while retaining the original <= 0 comparison. No extra finite-number or positive-balance filter is introduced.',
  },
  {
    anchor:
      '.sort((left, right) => getPriority(right.blockchain) - getPriority(left.blockchain))',
    kind: 'Convention',
    title: 'Explicit descending comparator',
    body: 'A priority difference gives the same descending order and returns zero for ties. The original undefined return is treated as a tie by JavaScript, so this is clarity, not a new sorting rule. filter already creates a new array.',
  },
  {
    anchor: '.map((balance) => ({ ...balance, formatted: balance.amount.toFixed() }))',
    kind: 'Preserved',
    title: 'Keep default rounding',
    body: 'Use toFixed() exactly as supplied, without choosing a new token precision. Format only the filtered, sorted list and pass it to rows.',
  },
  {
    anchor: 'return amount * (price ?? Number.NaN)',
    kind: 'Preserved',
    title: 'Same USD calculation',
    body: 'For the declared number-or-undefined price type, this matches prices[currency] * amount, including zero, negative prices, overflow and NaN for missing prices.',
  },
]

// Resolve against source text, not guessed line numbers or diff row positions.
export const indexReviewNotes = (
  source: string,
  notes: ReviewNote[],
): Map<number, ReviewNote> => {
  const lines = source.split('\n')
  const result = new Map<number, ReviewNote>()
  for (const note of notes) {
    const matches = lines.flatMap((line, index) =>
      line.trim() === note.anchor ? [index + 1] : [],
    )
    if (matches.length !== 1)
      throw new Error(`Review note needs one exact anchor: ${note.anchor}`)
    result.set(matches[0], note)
  }
  return result
}
