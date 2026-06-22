import { FIRE_MASTER_ACTIONS, PLAYER_ACTIONS } from './gameConstants'
import type {
  Challenger,
  ChallengerAction,
  FireMasterAction,
  FireMasterState,
  GameState,
  GameStatus,
  RevealedMove,
  StoredGameStateResult,
  TurnEvent,
} from './types'

export function serializeGameState(gameState: GameState): string {
  return JSON.stringify(gameState)
}

export function parseStoredGameState(
  rawValue: string | null,
): StoredGameStateResult {
  if (!rawValue) {
    return {
      gameState: null,
      errorMessage: 'No saved Agni Kai game was found.',
    }
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isGameStateLike(parsedValue)) {
      return {
        gameState: null,
        errorMessage: 'The saved Agni Kai game has an unsupported shape.',
      }
    }

    return {
      gameState: {
        ...parsedValue,
        recentEvents: parsedValue.recentEvents ?? [],
      },
      errorMessage: null,
    }
  } catch (error) {
    return {
      gameState: null,
      errorMessage:
        error instanceof SyntaxError
          ? 'The saved Agni Kai game could not be parsed.'
          : 'The saved Agni Kai game could not be loaded.',
    }
  }
}

function isGameStateLike(
  value: unknown,
): value is Omit<GameState, 'recentEvents'> & {
  recentEvents?: TurnEvent[]
} {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.turn === 'number' &&
    isGameStatus(value.status) &&
    Array.isArray(value.challengers) &&
    value.challengers.every(isChallenger) &&
    isFireMasterState(value.fireMaster) &&
    Array.isArray(value.revealedMoves) &&
    value.revealedMoves.every(isRevealedMove) &&
    (value.recentEvents === undefined ||
      (Array.isArray(value.recentEvents) &&
        value.recentEvents.every(isTurnEvent))) &&
    Array.isArray(value.turnLog) &&
    value.turnLog.every((entry) => typeof entry === 'string')
  )
}

function isChallenger(value: unknown): value is Challenger {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.health === 'number' &&
    typeof value.maxHealth === 'number' &&
    typeof value.isActive === 'boolean' &&
    typeof value.hasLightningCharge === 'boolean' &&
    (value.previousAction === null || isChallengerAction(value.previousAction))
  )
}

function isFireMasterState(value: unknown): value is FireMasterState {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.health === 'number' &&
    typeof value.maxHealth === 'number' &&
    typeof value.patternId === 'string' &&
    typeof value.moveIndex === 'number' &&
    (value.queuedPatternId === undefined ||
      typeof value.queuedPatternId === 'string') &&
    (value.lastAction === null || isFireMasterAction(value.lastAction))
  )
}

function isRevealedMove(value: unknown): value is RevealedMove {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.turn === 'number' &&
    (value.patternName === undefined || typeof value.patternName === 'string') &&
    isFireMasterAction(value.action)
  )
}

function isTurnEvent(value: unknown): value is TurnEvent {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false
  }

  if (value.type === 'damage') {
    return isDamageEvent(value)
  }

  if (value.type === 'blocked') {
    return isBlockedEvent(value)
  }

  if (value.type === 'charge') {
    return typeof value.challengerId === 'number'
  }

  if (value.type === 'recover') {
    return typeof value.amount === 'number'
  }

  if (value.type === 'read') {
    return typeof value.count === 'number'
  }

  if (value.type === 'readBlocked') {
    return true
  }

  return false
}

function isDamageEvent(value: Record<string, unknown>): boolean {
  return (
    typeof value.amount === 'number' &&
    (value.target === 'fireMaster' ||
      (value.target === 'challenger' && typeof value.challengerId === 'number'))
  )
}

function isBlockedEvent(value: Record<string, unknown>): boolean {
  return (
    (value.target === 'fireMaster' &&
      (value.challengerId === undefined ||
        typeof value.challengerId === 'number')) ||
    (value.target === 'challenger' && typeof value.challengerId === 'number')
  )
}

function isGameStatus(value: unknown): value is GameStatus {
  return value === 'playing' || value === 'won' || value === 'lost'
}

function isChallengerAction(value: unknown): value is ChallengerAction {
  return PLAYER_ACTIONS.some((action) => action === value)
}

function isFireMasterAction(value: unknown): value is FireMasterAction {
  return FIRE_MASTER_ACTIONS.some((action) => action === value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
