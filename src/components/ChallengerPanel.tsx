import {
  getLegalChallengerActions,
  type Challenger,
  type ChallengerAction,
  type ChallengerActionSelections,
  type TurnEvent,
} from '../game/agniKaiRules'
import { getChallengerEvents } from '../game/turnEvents'
import { getChallengerFeedbackClass } from '../ui/eventPresentation'
import { EventPills } from './ui/EventPills'
import { HealthBar } from './ui/HealthBar'

type ChallengerPanelProps = {
  challenger: Challenger
  recentEvents: TurnEvent[]
  selectedActions: Partial<ChallengerActionSelections>
  onActionChange: (challengerId: number, action: ChallengerAction) => void
}

export function ChallengerPanel(props: ChallengerPanelProps) {
  const legalActions = getLegalChallengerActions(props.challenger)
  const selectedAction = props.selectedActions[props.challenger.id] ?? ''
  const challengerFeedbackClass = getChallengerFeedbackClass(
    props.challenger.id,
    props.recentEvents,
  )
  const challengerEvents = getChallengerEvents(
    props.challenger.id,
    props.recentEvents,
  )

  return (
    <article
      className={`min-w-0 border border-[var(--agni-border)] bg-[rgba(255,249,230,0.72)] p-2.5 shadow-[0_3px_0_rgba(106,36,16,0.28)] ${challengerFeedbackClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="agni-display text-base">
            Challenger {props.challenger.id}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--agni-ink-muted)]">
            {props.challenger.hasLightningCharge
              ? 'Lightning charged'
              : 'No charge ready'}
          </p>
        </div>
        {props.challenger.previousAction ? (
          <span className="border border-[var(--agni-border)] bg-[var(--agni-cream)] px-2 py-0.5 text-xs font-semibold text-[var(--agni-ink-muted)]">
            Last: {props.challenger.previousAction}
          </span>
        ) : null}
      </div>

      <div className="mt-2">
        <HealthBar
          currentHealth={props.challenger.health}
          label="Challenger health"
          maxHealth={props.challenger.maxHealth}
          tone="amber"
        />
      </div>

      <label className="mt-2 block text-sm font-semibold uppercase tracking-wide text-[var(--agni-ink)]">
        Action
        <select
          className="agni-select mt-1.5 w-full px-2 py-1.5 text-sm"
          value={selectedAction}
          onChange={(event) =>
            props.onActionChange(
              props.challenger.id,
              event.target.value as ChallengerAction,
            )
          }
        >
          <option value="" disabled>
            Select action
          </option>
          {legalActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </label>
      <EventPills events={challengerEvents} />
    </article>
  )
}
