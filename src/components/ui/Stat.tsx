type StatProps = {
  label: string
  value: string
}

export function Stat(props: StatProps) {
  return (
    <div className="border border-[var(--agni-border)] bg-[rgba(255,244,209,0.08)] p-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--agni-gold)]">
        {props.label}
      </dt>
      <dd className="mt-1 font-semibold text-[var(--agni-cream)]">{props.value}</dd>
    </div>
  )
}
