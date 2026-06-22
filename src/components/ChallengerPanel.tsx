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
      className={`rounded-lg border border-slate-200 bg-slate-50 p-3 ${challengerFeedbackClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold">
            Challenger {props.challenger.id}
          </h3>
          <p className="mt-0.5 text-xs text-slate-600">
            {props.challenger.hasLightningCharge
              ? 'Lightning charged'
              : 'No charge ready'}
          </p>
        </div>
        {props.challenger.previousAction ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            Last: {props.challenger.previousAction}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <HealthBar
          currentHealth={props.challenger.health}
          label="Challenger health"
          maxHealth={props.challenger.maxHealth}
          tone="amber"
        />
      </div>

      <label className="mt-3 block text-sm font-semibold text-slate-700">
        Action
        <select
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
