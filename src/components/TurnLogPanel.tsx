type TurnLogPanelProps = {
  entries: string[]
}

export function TurnLogPanel(props: TurnLogPanelProps) {
  return (
    <div className="agni-panel flex flex-col overflow-hidden p-3 xl:min-h-0">
      <h2 className="agni-display text-lg">Turn log</h2>
      <ol className="agni-scrollbar mt-2 space-y-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
        {props.entries.map((entry) => (
          <li
            className="border-l-4 border-[var(--agni-border)] bg-[rgba(255,249,230,0.72)] px-3 py-2 text-xs leading-5 text-[var(--agni-ink-muted)] sm:text-sm"
            key={entry}
          >
            {entry}
          </li>
        ))}
      </ol>
    </div>
  )
}
