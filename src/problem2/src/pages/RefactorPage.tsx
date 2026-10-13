import { Fragment, useMemo, useState } from 'react'
import { Columns2, List } from 'lucide-react'
import original from '../../../problem3/original.tsx.txt?raw'
import helpers from '../../../problem3/balances.ts?raw'
import component from '../../../problem3/WalletPage.tsx?raw'
import { PageHeading } from '../components/PageHeading'
import { Highlight } from '../components/CodeBlock'
import { buildDiffRows, type DiffLine } from '../lib/diff-rows'
import {
  originalNotes,
  componentNotes,
  helperNotes,
  indexReviewNotes,
  type ReviewNote,
} from '../lib/refactor-notes'

const beforeNotes = indexReviewNotes(original, originalNotes)
const afterNotes = {
  component: indexReviewNotes(component, componentNotes),
  helpers: indexReviewNotes(helpers, helperNotes),
}
const Cell = ({
  line,
  side,
  note,
}: {
  line?: DiffLine
  side: 'left' | 'right'
  note?: ReviewNote
}) => {
  return (
    <td
      className={`diff-cell ${line?.changed ? (side === 'left' ? 'removed' : 'added') : ''} ${line ? '' : 'blank'}`}
    >
      <span className="diff-line-number">{line?.number}</span>
      <span
        className="diff-sign"
        aria-label={line?.changed ? (side === 'left' ? 'removed' : 'added') : undefined}
      >
        {line?.changed ? (side === 'left' ? '−' : '+') : ' '}
      </span>
      <code>{line && <Highlight code={line.text || ' '} language="tsx" />}</code>
      {note && (
        <aside
          className="diff-note"
          aria-label={`${side === 'left' ? 'Original' : 'Refactored'} line ${line?.number}: ${note.title}`}
          data-note-line={line?.number}
          data-note-side={side}
        >
          <span className="diff-note-kind">{note.kind}</span>
          <strong>{note.title}</strong>
          <p>{note.body}</p>
        </aside>
      )}
    </td>
  )
}
export const RefactorPage = () => {
  const [mode, setMode] = useState<'split' | 'unified'>(() =>
    window.matchMedia('(max-width: 640px)').matches ? 'unified' : 'split',
  )
  const [file, setFile] = useState<'component' | 'helpers'>('component')
  const split = mode === 'split' && file === 'component'
  const filename = file === 'component' ? 'WalletPage.tsx' : 'balances.ts'
  const before = file === 'component' ? original : ''
  const after = file === 'component' ? component : helpers
  const rows = useMemo(() => buildDiffRows(before, after), [before, after])
  return (
    <div className="page diff-page">
      <PageHeading
        number="03"
        title="React refactor"
        description="Move balance filtering, sorting and formatting into a helper. Keep the component focused on rendering, while preserving the original filter, rounding and price calculation."
      />
      <div className="file-tabs" role="tablist" aria-label="Refactored files">
        <button
          type="button"
          role="tab"
          id="component-tab"
          aria-selected={file === 'component'}
          aria-controls="file-diff"
          onClick={() => setFile('component')}
        >
          WalletPage.tsx
        </button>
        <button
          type="button"
          role="tab"
          id="helpers-tab"
          aria-selected={file === 'helpers'}
          aria-controls="file-diff"
          onClick={() => setFile('helpers')}
        >
          balances.ts <span className="new-file-label">new</span>
        </button>
      </div>
      <div className="diff-toolbar">
        <div>
          <b>{filename}</b>
          <span>
            {file === 'component' ? 'Original → refactored' : 'New helper file'}
          </span>
        </div>
        <div className="diff-actions">
          <div className="segmented">
            <button
              type="button"
              aria-pressed={split}
              disabled={file === 'helpers'}
              onClick={() => setMode('split')}
            >
              <Columns2 size={14} />
              Split
            </button>
            <button
              type="button"
              aria-pressed={!split}
              onClick={() => setMode('unified')}
            >
              <List size={14} />
              Unified
            </button>
          </div>
        </div>
      </div>
      <div
        id="file-diff"
        role="tabpanel"
        aria-labelledby={file === 'component' ? 'component-tab' : 'helpers-tab'}
        className="diff-scroll"
        tabIndex={0}
        aria-label="Code comparison"
      >
        <table className={`diff-table ${split ? 'split' : 'unified'}`}>
          <thead>
            <tr>
              {split ? (
                <>
                  <th>
                    {file === 'component'
                      ? 'Original · WalletPage.tsx'
                      : 'No previous file'}
                  </th>
                  <th>Refactored · {filename}</th>
                </>
              ) : (
                <th>Unified comparison</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Fragment key={index}>
                {split ? (
                  <tr>
                    <Cell
                      line={row.left}
                      side="left"
                      note={
                        file === 'component' && row.left
                          ? beforeNotes.get(row.left.number)
                          : undefined
                      }
                    />
                    <Cell
                      line={row.right}
                      side="right"
                      note={
                        row.right ? afterNotes[file].get(row.right.number) : undefined
                      }
                    />
                  </tr>
                ) : (
                  <>
                    {row.left && (
                      <tr>
                        <Cell
                          line={row.left}
                          side="left"
                          note={
                            file === 'component' && row.left
                              ? beforeNotes.get(row.left.number)
                              : undefined
                          }
                        />
                      </tr>
                    )}
                    {row.right && (!row.left || row.right.changed) && (
                      <tr>
                        <Cell
                          line={row.right}
                          side="right"
                          note={
                            row.right ? afterNotes[file].get(row.right.number) : undefined
                          }
                        />
                      </tr>
                    )}
                  </>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
