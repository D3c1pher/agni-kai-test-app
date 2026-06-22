type HealthBarProps = {
  currentHealth: number
  label: string
  maxHealth: number
  tone: 'amber' | 'red'
}

export function HealthBar(props: HealthBarProps) {
  const healthPercent =
    props.maxHealth > 0 ? (props.currentHealth / props.maxHealth) * 100 : 0
  const barColor =
    props.tone === 'red'
      ? 'bg-[var(--agni-rust-bright)]'
      : 'bg-[var(--agni-gold)]'

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold uppercase tracking-wide text-inherit">{props.label}</span>
        <span className="font-semibold text-inherit">
          {props.currentHealth} / {props.maxHealth}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden border border-[var(--agni-border)] bg-[rgba(215,164,87,0.18)]">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  )
}
