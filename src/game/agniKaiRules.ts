import { FIRE_MASTER_PATTERNS } from './fireMasterPatterns'
import type { FireMasterPattern } from './fireMasterPatterns'

export const STORAGE_KEY = 'agni-kai-game-state-v1'

export type ChallengerAction =
  | 'Strike'
  | 'Guard'
  | 'Charge'
  | 'Lightning'
  | 'Read'

export type FireMasterAction =
  | 'Strike'
  | 'Guard'
  | 'Charge'
  | 'Lightning'
  | 'Recover'

export type GameStatus = 'playing' | 'won' | 'lost'

export type Challenger = {
  id: number
  health: number
  maxHealth: number
  isActive: boolean
  hasLightningCharge: boolean
  previousAction: ChallengerAction | null
}

export type FireMasterState = {
  health: number
  maxHealth: number
  patternId: string
  moveIndex: number
  lastAction: FireMasterAction | null
}

export type RevealedMove = {
  turn: number
  patternName: string
  action: FireMasterAction
}

export type GameState = {
  status: GameStatus
  turn: number
  challengers: Challenger[]
  fireMaster: FireMasterState
  revealedMoves: RevealedMove[]
  turnLog: string[]
}

export type ChallengerActionSelections = Record<number, ChallengerAction>

export type StoredGameStateResult =
  | {
      gameState: GameState
      errorMessage: null
    }
  | {
      gameState: null
      errorMessage: string
    }

const MAX_ACTIVE_CHALLENGERS = 3
const CHALLENGER_MAX_HEALTH = 3
const FIRE_MASTER_HEALTH_BONUS = 10
const FIRE_MASTER_RECOVERY = 2

const PLAYER_ACTIONS = [
  'Strike',
  'Guard',
  'Charge',
  'Lightning',
  'Read',
] as const satisfies readonly ChallengerAction[]

export function createGameState(challengerCount: number): GameState {
  const firstPattern = chooseRandomPattern()

  return {
    status: 'playing',
    turn: 1,
    challengers: Array.from({ length: challengerCount }, (_, index) => ({
      id: index + 1,
      health: CHALLENGER_MAX_HEALTH,
      maxHealth: CHALLENGER_MAX_HEALTH,
      isActive: index < MAX_ACTIVE_CHALLENGERS,
      hasLightningCharge: false,
      previousAction: null,
    })),
    fireMaster: {
      health: challengerCount * CHALLENGER_MAX_HEALTH + FIRE_MASTER_HEALTH_BONUS,
      maxHealth:
        challengerCount * CHALLENGER_MAX_HEALTH + FIRE_MASTER_HEALTH_BONUS,
      patternId: firstPattern.id,
      moveIndex: 0,
      lastAction: null,
    },
    revealedMoves: [],
    turnLog: [`The Fire Master begins with ${firstPattern.name}.`],
  }
}

export function getActiveChallengers(gameState: GameState): Challenger[] {
  return gameState.challengers.filter(
    (challenger) => challenger.isActive && challenger.health > 0,
  )
}

export function getBackupChallengers(gameState: GameState): Challenger[] {
  return gameState.challengers.filter(
    (challenger) => !challenger.isActive && challenger.health > 0,
  )
}

export function getDeadChallengers(gameState: GameState): Challenger[] {
  return gameState.challengers.filter((challenger) => challenger.health <= 0)
}

export function getCurrentPattern(gameState: GameState): FireMasterPattern {
  return findPatternById(gameState.fireMaster.patternId)
}

export function getCurrentFireMasterAction(
  gameState: GameState,
): FireMasterAction {
  return getCurrentPattern(gameState).moves[gameState.fireMaster.moveIndex]
}

export function getLegalChallengerActions(
  challenger: Challenger,
  selections: Partial<ChallengerActionSelections>,
): ChallengerAction[] {
  return PLAYER_ACTIONS.filter((action) => {
    if (action === 'Guard') {
      return challenger.previousAction !== 'Guard'
    }

    if (action === 'Lightning') {
      return canSelectLightning(challenger, selections)
    }

    return true
  })
}

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

    return getLegalChallengerActions(challenger, selections).includes(
      selectedAction,
    )
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
  const currentPattern = getCurrentPattern(gameState)
  const playerDamage = calculatePlayerDamage(activeChallengers, selections)
  const readCount = countReaders(activeChallengers, selections)
  const fireMasterHealthAfterPlayerDamage = Math.max(
    0,
    gameState.fireMaster.health - playerDamage,
  )
  const fireMasterHealthAfterRecovery =
    fireMasterAction === 'Recover' && fireMasterHealthAfterPlayerDamage > 0
      ? Math.min(
          gameState.fireMaster.maxHealth,
          fireMasterHealthAfterPlayerDamage + FIRE_MASTER_RECOVERY,
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

  return {
    status,
    turn: status === 'playing' ? nextTurn : gameState.turn,
    challengers: challengersForNextTurn,
    fireMaster: advancedFireMaster,
    revealedMoves:
      readCount > 0
        ? [
            ...getFutureFireMasterMoves(advancedFireMaster, nextTurn, readCount),
            ...gameState.revealedMoves,
          ]
        : gameState.revealedMoves,
    turnLog: trimTurnLog([
      createTurnSummary({
        turn: gameState.turn,
        activeChallengers,
        selections,
        fireMasterAction,
        patternName: currentPattern.name,
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

export function serializeGameState(gameState: GameState): string {
  return JSON.stringify(gameState)
}

export function parseStoredGameState(rawValue: string | null): StoredGameStateResult {
  if (!rawValue) {
    return {
      gameState: null,
      errorMessage: 'No saved Agni Kai game was found.',
    }
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isGameState(parsedValue)) {
      return {
        gameState: null,
        errorMessage: 'The saved Agni Kai game has an unsupported shape.',
      }
    }

    return {
      gameState: parsedValue,
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

function canSelectLightning(
  challenger: Challenger,
  selections: Partial<ChallengerActionSelections>,
): boolean {
  if (!challenger.hasLightningCharge) {
    return false
  }

  return Object.entries(selections).every(([challengerId, action]) => {
    return action !== 'Lightning' || Number(challengerId) === challenger.id
  })
}

function calculatePlayerDamage(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): number {
  return activeChallengers.reduce((damage, challenger) => {
    const selectedAction = selections[challenger.id]

    if (selectedAction === 'Strike') {
      return damage + 1
    }

    if (selectedAction === 'Lightning') {
      return damage + 3
    }

    return damage
  }, 0)
}

function countReaders(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): number {
  return activeChallengers.filter(
    (challenger) => selections[challenger.id] === 'Read',
  ).length
}

function applyPlayerActionState(
  challenger: Challenger,
  selections: ChallengerActionSelections,
): Challenger {
  if (challenger.health <= 0) {
    return {
      ...challenger,
      isActive: false,
      hasLightningCharge: false,
    }
  }

  const selectedAction = selections[challenger.id]

  if (!selectedAction) {
    return {
      ...challenger,
      hasLightningCharge: false,
    }
  }

  return {
    ...challenger,
    hasLightningCharge: selectedAction === 'Charge',
    previousAction: selectedAction,
  }
}

function applyFireMasterAction(
  challengers: Challenger[],
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
  fireMasterAction: FireMasterAction,
): Challenger[] {
  if (fireMasterAction === 'Strike') {
    const damagedIds = new Set(
      activeChallengers
        .filter((challenger) => selections[challenger.id] !== 'Guard')
        .map((challenger) => challenger.id),
    )

    return challengers.map((challenger) =>
      damagedIds.has(challenger.id)
        ? damageChallenger(challenger, 1)
        : challenger,
    )
  }

  if (fireMasterAction === 'Lightning') {
    const target = activeChallengers.find(
      (challenger) => selections[challenger.id] !== 'Guard',
    )

    if (!target) {
      return challengers
    }

    return challengers.map((challenger) =>
      challenger.id === target.id ? damageChallenger(challenger, 3) : challenger,
    )
  }

  return challengers
}

function damageChallenger(challenger: Challenger, damage: number): Challenger {
  const health = Math.max(0, challenger.health - damage)

  return {
    ...challenger,
    health,
    isActive: health > 0 && challenger.isActive,
  }
}

function refillActiveChallengers(challengers: Challenger[]): Challenger[] {
  const livingActiveCount = challengers.filter(
    (challenger) => challenger.isActive && challenger.health > 0,
  ).length
  let openSlots = MAX_ACTIVE_CHALLENGERS - livingActiveCount

  if (openSlots <= 0) {
    return challengers
  }

  return challengers.map((challenger) => {
    if (openSlots <= 0 || challenger.isActive || challenger.health <= 0) {
      return challenger
    }

    openSlots -= 1

    return {
      ...challenger,
      isActive: true,
      hasLightningCharge: false,
    }
  })
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

function advanceFireMaster(fireMaster: FireMasterState): FireMasterState {
  const currentPattern = findPatternById(fireMaster.patternId)
  const nextMoveIndex = fireMaster.moveIndex + 1

  if (nextMoveIndex < currentPattern.moves.length) {
    return {
      ...fireMaster,
      moveIndex: nextMoveIndex,
    }
  }

  const nextPattern = chooseRandomPattern()

  return {
    ...fireMaster,
    patternId: nextPattern.id,
    moveIndex: 0,
  }
}

function getFutureFireMasterMoves(
  fireMaster: FireMasterState,
  nextTurn: number,
  readCount: number,
): RevealedMove[] {
  const revealedMoves: RevealedMove[] = []
  let pattern = findPatternById(fireMaster.patternId)
  let moveIndex = fireMaster.moveIndex

  for (let revealIndex = 0; revealIndex < readCount; revealIndex += 1) {
    revealedMoves.push({
      turn: nextTurn + revealIndex,
      patternName: pattern.name,
      action: pattern.moves[moveIndex],
    })

    moveIndex += 1

    if (moveIndex >= pattern.moves.length) {
      pattern = chooseRandomPattern()
      moveIndex = 0
    }
  }

  return revealedMoves
}

function createTurnSummary(details: {
  turn: number
  activeChallengers: Challenger[]
  selections: ChallengerActionSelections
  fireMasterAction: FireMasterAction
  patternName: string
  playerDamage: number
  fireMasterHealthBefore: number
  fireMasterHealthAfter: number
  challengersBefore: Challenger[]
  challengersAfter: Challenger[]
}): string {
  const playerActions = details.activeChallengers
    .map(
      (challenger) =>
        `C${challenger.id} ${details.selections[challenger.id]}`,
    )
    .join(', ')
  const defeatedChallengers = details.challengersAfter.filter((challenger) => {
    const previousChallenger = details.challengersBefore.find(
      (beforeChallenger) => beforeChallenger.id === challenger.id,
    )

    return (
      previousChallenger &&
      previousChallenger.health > 0 &&
      challenger.health <= 0
    )
  })
  const defeatedText =
    defeatedChallengers.length > 0
      ? ` Defeated: ${defeatedChallengers
          .map((challenger) => `C${challenger.id}`)
          .join(', ')}.`
      : ''

  return `Turn ${details.turn}: ${playerActions}. Fire Master used ${details.fireMasterAction} from ${details.patternName}. Fire Master ${details.fireMasterHealthBefore} -> ${details.fireMasterHealthAfter} after ${details.playerDamage} damage.${defeatedText}`
}

function trimTurnLog(turnLog: string[]): string[] {
  return turnLog.slice(0, 10)
}

function chooseRandomPattern(): FireMasterPattern {
  const patternIndex = Math.floor(Math.random() * FIRE_MASTER_PATTERNS.length)

  return FIRE_MASTER_PATTERNS[patternIndex]
}

function findPatternById(patternId: string): FireMasterPattern {
  return (
    FIRE_MASTER_PATTERNS.find((pattern) => pattern.id === patternId) ??
    FIRE_MASTER_PATTERNS[0]
  )
}

function isGameState(value: unknown): value is GameState {
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
    (value.lastAction === null || isFireMasterAction(value.lastAction))
  )
}

function isRevealedMove(value: unknown): value is RevealedMove {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.turn === 'number' &&
    typeof value.patternName === 'string' &&
    isFireMasterAction(value.action)
  )
}

function isGameStatus(value: unknown): value is GameStatus {
  return value === 'playing' || value === 'won' || value === 'lost'
}

function isChallengerAction(value: unknown): value is ChallengerAction {
  return PLAYER_ACTIONS.some((action) => action === value)
}

function isFireMasterAction(value: unknown): value is FireMasterAction {
  return (
    value === 'Strike' ||
    value === 'Guard' ||
    value === 'Charge' ||
    value === 'Lightning' ||
    value === 'Recover'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
