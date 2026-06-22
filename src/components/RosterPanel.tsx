import type { Challenger } from '../game/agniKaiRules'

type RosterPanelProps = {
  backupChallengers: Challenger[]
  deadChallengers: Challenger[]
}

type RosterGroupProps = {
  challengers: Challenger[]
  label: string
}

export function RosterPanel(props: RosterPanelProps) {
  return (
    <div className="agni-panel flex flex-col overflow-hidden p-3 xl:min-h-0">
      <h2 className="agni-display text-lg">Roster</h2>
      <div className="agni-scrollbar xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
        <RosterGroup challengers={props.backupChallengers} label="Backup" />
        <RosterGroup challengers={props.deadChallengers} label="Defeated" />
      </div>
    </div>
  )
}

function RosterGroup(props: RosterGroupProps) {
  return (
    <div className="mt-2">
      <h3 className="agni-kicker !text-[var(--agni-rust)]">
        {props.label}
      </h3>
      {props.challengers.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {props.challengers.map((challenger) => (
            <span
              className="border border-[var(--agni-border)] bg-[var(--agni-cream)] px-2 py-0.5 text-xs font-semibold text-[var(--agni-ink)]"
              key={challenger.id}
            >
              C{challenger.id} {challenger.health}/{challenger.maxHealth}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--agni-ink-muted)]">None</p>
      )}
    </div>
  )
}
