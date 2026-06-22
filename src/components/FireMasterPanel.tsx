import { getFireMasterEvents } from '../game/turnEvents'
import {
  getCurrentPattern,
  getRevealedMoveForTurn,
  type GameState,
} from '../game/agniKaiRules'
import { getFireMasterFeedbackClass } from '../ui/eventPresentation'
import { EventPills } from './ui/EventPills'
import { HealthBar } from './ui/HealthBar'
import { Stat } from './ui/Stat'

type FireMasterPanelProps = {
  gameState: GameState
}

export function FireMasterPanel(props: FireMasterPanelProps) {
  const fireMasterFeedbackClass = getFireMasterFeedbackClass(
    props.gameState.recentEvents,
  )
  const revealedCurrentMove = getRevealedMoveForTurn(
    props.gameState.revealedMoves,
    props.gameState.turn,
  )
  const currentPattern = getCurrentPattern(props.gameState)

  return (
    <div
      className={`agni-panel-dark agni-scrollbar overflow-y-auto p-3 xl:min-h-0 xl:overscroll-contain ${fireMasterFeedbackClass}`}
    >
      <div>
        <p className="agni-kicker">
          Fire Master
        </p>
        <h2 className="agni-display text-xl">AI opponent</h2>
      </div>
      <div className="mt-3">
        <HealthBar
          currentHealth={props.gameState.fireMaster.health}
          label="Fire Master health"
          maxHealth={props.gameState.fireMaster.maxHealth}
          tone="red"
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Stat
          label="Last action"
          value={props.gameState.fireMaster.lastAction ?? 'None yet'}
        />
        <Stat
          label="Pattern step"
          value={`${props.gameState.fireMaster.moveIndex + 1} / ${
            currentPattern.moves.length
          }`}
        />
      </dl>
      {revealedCurrentMove ? (
        <div className="mt-2 border border-[var(--agni-gold)] bg-[var(--agni-parchment)] px-3 py-2 text-sm font-semibold text-[var(--agni-ink)]">
          Next move: {revealedCurrentMove.action}
        </div>
      ) : null}
      <EventPills
        events={getFireMasterEvents(props.gameState.recentEvents)}
      />
    </div>
  )
}
