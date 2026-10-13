import { diffLines } from 'diff'
export interface DiffLine {
  number: number
  text: string
  changed: boolean
}
export interface DiffRow {
  left?: DiffLine
  right?: DiffLine
}
// Turn line changes into rows for the split and unified code views.
export const buildDiffRows = (before: string, after: string): DiffRow[] => {
  const parts = diffLines(before, after),
    rows: DiffRow[] = []
  let left = 1,
    right = 1
  // Remove the final newline without adding an extra empty row.
  const lines = (value: string) => value.replace(/\n$/, '').split('\n')
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]
    // Unchanged lines appear on both sides with their own line numbers.
    if (!part.added && !part.removed) {
      for (const text of lines(part.value))
        rows.push({
          left: { number: left++, text, changed: false },
          right: { number: right++, text, changed: false },
        })
      continue
    }
    const removed = part.removed ? lines(part.value) : []
    let added = part.added ? lines(part.value) : []
    // Place a removed block beside the following added block.
    if (part.removed && parts[index + 1]?.added) added = lines(parts[++index].value)
    // Leave one side blank when the two blocks have different lengths.
    for (let i = 0; i < Math.max(removed.length, added.length); i++)
      rows.push({
        left:
          removed[i] === undefined
            ? undefined
            : { number: left++, text: removed[i], changed: true },
        right:
          added[i] === undefined
            ? undefined
            : { number: right++, text: added[i], changed: true },
      })
  }
  return rows
}
