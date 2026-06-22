import {
  countReaders,
  getLegalChallengerActions,
  getRecoveryAmount,
  resolvePlayerDamage,
} from './challengerActions'
import {
  applyFireMasterAction,
  applyPlayerActionState,
  refillActiveChallengers,
} from './challengerState'
import { MAX_REVEALED_FUTURE_TURNS } from './gameConstants'
import {
  advanceFireMaster,
  getFutureFireMasterMoves,
  getUnresolvedRevealedMoves,
} from './fireMasterProgression'
import {
  getActiveChallengers,
  getCurrentFireMasterAction,
} from './selectors'
import { createTurnEvents } from './turnEvents'
import { createTurnSummary, trimTurnLog } from './turnSummary'
import type {
  Challenger,
  ChallengerActionSelections,
  GameState,
  GameStatus,
} from './types'

export function canResolveTurn(
  gameState: GameState,
  selections: Partial<ChallengerActionSelections>,
): selections is ChallengerActionSelections {
  if (gameState.status !== 'playing') {
    return false
  }

  return getActiveChallengers(gameState).every((challenger) => {
    const selectedAction = selections[challenger.id]

    if (!selectedAction) {
      return false
    }

    return getLegalChallengerActions(challenger).includes(selectedAction)
  })
}

export function resolveTurn(
  gameState: GameState,
  selections: ChallengerActionSelections,
): GameState {
  if (!canResolveTurn(gameState, selections)) {
    return gameState
  }

  const activeChallengers = getActiveChallengers(gameState)
  const fireMasterAction = getCurrentFireMasterAction(gameState)
  const playerDamageResolution = resolvePlayerDamage(
    activeChallengers,
    selections,
    fireMasterAction === 'Guard',
  )
  const playerDamage = playerDamageResolution.appliedDamage
  const readCount = countReaders(activeChallengers, selections)
  const recoveryAmount = getRecoveryAmount(
    gameState.fireMaster.health,
    playerDamage,
    gameState.fireMaster.maxHealth,
    fireMasterAction,
  )
  const fireMasterHealthAfterPlayerDamage = Math.max(
    0,
    gameState.fireMaster.health - playerDamage,
  )
  const fireMasterHealthAfterRecovery =
    recoveryAmount > 0
      ? Math.min(
          gameState.fireMaster.maxHealth,
          fireMasterHealthAfterPlayerDamage + recoveryAmount,
        )
      : fireMasterHealthAfterPlayerDamage
  const challengersAfterPlayerActions = gameState.challengers.map(
    (challenger) => applyPlayerActionState(challenger, selections),
  )
  const challengersAfterFireMasterAction = applyFireMasterAction(
    challengersAfterPlayerActions,
    activeChallengers,
    selections,
    fireMasterAction,
  )
  const advancedFireMaster = advanceFireMaster({
    ...gameState.fireMaster,
    health: fireMasterHealthAfterRecovery,
    lastAction: fireMasterAction,
  })
  const challengersForNextTurn = refillActiveChallengers(
    challengersAfterFireMasterAction,
  )
  const status = getNextStatus(
    fireMasterHealthAfterRecovery,
    challengersForNextTurn,
  )
  const nextTurn = gameState.turn + 1
  const unresolvedRevealedMoves = getUnresolvedRevealedMoves(
    gameState.revealedMoves,
    nextTurn,
  )
  const newRevealedMoves =
    readCount > 0
      ? getFutureFireMasterMoves(
          advancedFireMaster,
          nextTurn,
          readCount,
          unresolvedRevealedMoves,
          MAX_REVEALED_FUTURE_TURNS,
        )
      : {
          fireMaster: advancedFireMaster,
          revealedMoves: [],
        }
  const revealedMoves = [
    ...newRevealedMoves.revealedMoves,
    ...unresolvedRevealedMoves,
  ].sort(
    (firstMove, secondMove) => secondMove.turn - firstMove.turn,
  )
  const recentEvents = createTurnEvents({
    activeChallengers,
    selections,
    fireMasterAction,
    blockedChallengerId: playerDamageResolution.blockedChallengerId,
    playerDamage,
    recoveryAmount,
    readCount,
    revealedReadCount: newRevealedMoves.revealedMoves.length,
    challengersBefore: gameState.challengers,
    challengersAfter: challengersForNextTurn,
  })

  return {
    status,
    turn: status === 'playing' ? nextTurn : gameState.turn,
    challengers: challengersForNextTurn,
    fireMaster: newRevealedMoves.fireMaster,
    revealedMoves,
    recentEvents,
    turnLog: trimTurnLog([
      createTurnSummary({
        turn: gameState.turn,
        activeChallengers,
        selections,
        fireMasterAction,
        playerDamage,
        fireMasterHealthBefore: gameState.fireMaster.health,
        fireMasterHealthAfter: fireMasterHealthAfterRecovery,
        challengersBefore: gameState.challengers,
        challengersAfter: challengersForNextTurn,
      }),
      ...gameState.turnLog,
    ]),
  }
}

function getNextStatus(
  fireMasterHealth: number,
  challengers: Challenger[],
): GameStatus {
  if (fireMasterHealth <= 0) {
    return 'won'
  }

  return challengers.some((challenger) => challenger.health > 0)
    ? 'playing'
    : 'lost'
}
