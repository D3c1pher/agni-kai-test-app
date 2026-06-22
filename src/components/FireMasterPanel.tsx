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
      className={`rounded-lg border border-red-200 bg-white p-4 shadow-sm ${fireMasterFeedbackClass}`}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Fire Master
        </p>
        <h2 className="mt-1 text-xl font-bold">AI opponent</h2>
      </div>
      <div className="mt-4">
        <HealthBar
          currentHealth={props.gameState.fireMaster.health}
          label="Fire Master health"
          maxHealth={props.gameState.fireMaster.maxHealth}
          tone="red"
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
        <div className="mt-3 rounded-md bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-900">
          Next move: {revealedCurrentMove.action}
        </div>
      ) : null}
      <EventPills
        events={getFireMasterEvents(props.gameState.recentEvents)}
      />
    </div>
  )
}
