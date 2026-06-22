import type { RevealedMove } from '../game/agniKaiRules'

type ReadResultsPanelProps = {
  revealedMoves: RevealedMove[]
  feedbackClass: string
  hasReadBlocked: boolean
}

export function ReadResultsPanel(props: ReadResultsPanelProps) {
  return (
    <div
      className={`agni-panel flex flex-col overflow-hidden p-3 xl:min-h-0 ${props.feedbackClass}`}
    >
      <h2 className="agni-display text-lg">Read results</h2>
      {props.hasReadBlocked ? (
        <p className="mt-2 border border-dashed border-[var(--agni-border)] bg-[rgba(143,67,32,0.08)] px-3 py-2 text-sm font-semibold text-[var(--agni-ink-muted)]">
          Unable to read. The read window is full.
        </p>
      ) : null}
      {props.revealedMoves.length > 0 ? (
        <ul className="agni-scrollbar mt-2 space-y-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
          {props.revealedMoves.map((move, moveIndex) => (
            <li
              className="border-l-4 border-[var(--agni-rust)] bg-[var(--agni-cream)] px-3 py-2 text-sm text-[var(--agni-ink)]"
              key={`${move.turn}-${move.action}-${moveIndex}`}
            >
              Turn {move.turn}: {move.action}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-5 text-[var(--agni-ink-muted)]">
          Use Read with active challengers to reveal upcoming Fire Master moves.
        </p>
      )}
    </div>
  )
}
