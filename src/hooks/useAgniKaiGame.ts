import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_CHALLENGER_COUNT,
  DEFAULT_CHALLENGER_MAX_HEALTH,
  DEFAULT_FIRE_MASTER_HEALTH_ADDITION,
  DEFAULT_FIRE_MASTER_HEALTH_MULTIPLIER,
  STORAGE_KEY,
  canResolveTurn,
  createGameState,
  getActiveChallengers,
  getBackupChallengers,
  getDeadChallengers,
  parseStoredGameState,
  resolveTurn,
  serializeGameState,
} from '../game/agniKaiRules'
import type {
  Challenger,
  ChallengerAction,
  ChallengerActionSelections,
  GameState,
} from '../game/agniKaiRules'

type InitialGame = {
  gameState: GameState | null
  storageWarning: string | null
}

type AgniKaiGameViewModelInput = {
  gameState: GameState | null
  storageWarning: string | null
  challengerInput: string
  challengerMaxHealthInput: string
  fireMasterHealthMultiplierInput: string
  fireMasterHealthAdditionInput: string
  selectedActions: Partial<ChallengerActionSelections>
  setChallengerInput: (value: string) => void
  setChallengerMaxHealthInput: (value: string) => void
  setFireMasterHealthMultiplierInput: (value: string) => void
  setFireMasterHealthAdditionInput: (value: string) => void
  startGame: () => void
  resetGame: () => void
  confirmTurn: () => void
  updateSelectedAction: (
    challengerId: number,
    selectedAction: ChallengerAction,
  ) => void
}

export type AgniKaiGameViewModel = {
  gameState: GameState | null
  storageWarning: string | null
  challengerInput: string
  challengerMaxHealthInput: string
  fireMasterHealthMultiplierInput: string
  fireMasterHealthAdditionInput: string
  canStartGame: boolean
  selectedActions: Partial<ChallengerActionSelections>
  activeChallengers: Challenger[]
  backupChallengers: Challenger[]
  deadChallengers: Challenger[]
  isTurnReady: boolean
  setChallengerInput: (value: string) => void
  setChallengerMaxHealthInput: (value: string) => void
  setFireMasterHealthMultiplierInput: (value: string) => void
  setFireMasterHealthAdditionInput: (value: string) => void
  startGame: () => void
  resetGame: () => void
  confirmTurn: () => void
  updateSelectedAction: (
    challengerId: number,
    selectedAction: ChallengerAction,
  ) => void
}

export type ActiveAgniKaiGameViewModel = AgniKaiGameViewModel & {
  gameState: GameState
}

export function useAgniKaiGame(): AgniKaiGameViewModel {
  const initialGame = useMemo(() => getInitialGame(), [])
  const [gameState, setGameState] = useState<GameState | null>(
    initialGame.gameState,
  )
  const [storageWarning, setStorageWarning] = useState<string | null>(
    initialGame.storageWarning,
  )
  const [challengerInput, setChallengerInput] = useState(
    String(DEFAULT_CHALLENGER_COUNT),
  )
  const [challengerMaxHealthInput, setChallengerMaxHealthInput] = useState(
    String(DEFAULT_CHALLENGER_MAX_HEALTH),
  )
  const [
    fireMasterHealthMultiplierInput,
    setFireMasterHealthMultiplierInput,
  ] = useState(String(DEFAULT_FIRE_MASTER_HEALTH_MULTIPLIER))
  const [fireMasterHealthAdditionInput, setFireMasterHealthAdditionInput] =
    useState(String(DEFAULT_FIRE_MASTER_HEALTH_ADDITION))
  const [selectedActions, setSelectedActions] = useState<
    Partial<ChallengerActionSelections>
  >({})
  const challengerCount = Number(challengerInput)
  const challengerMaxHealth = Number(challengerMaxHealthInput)
  const fireMasterHealthMultiplier = Number(fireMasterHealthMultiplierInput)
  const fireMasterHealthAddition = Number(fireMasterHealthAdditionInput)
  const canStartGame = canCreateGame({
    challengerInput,
    challengerMaxHealthInput,
    fireMasterHealthMultiplierInput,
    fireMasterHealthAdditionInput,
  })

  useEffect(() => {
    if (!gameState) {
      return
    }

    localStorage.setItem(STORAGE_KEY, serializeGameState(gameState))
  }, [gameState])

  const startGame = () => {
    if (!canStartGame) {
      return
    }

    setStorageWarning(null)
    setSelectedActions({})
    setGameState(
      createGameState(
        challengerCount,
        challengerMaxHealth,
        fireMasterHealthMultiplier,
        fireMasterHealthAddition,
      ),
    )
  }

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY)
    setGameState(null)
    setStorageWarning(null)
    setSelectedActions({})
  }

  const updateSelectedAction = (
    challengerId: number,
    selectedAction: ChallengerAction,
  ) => {
    setSelectedActions((currentActions) => ({
      ...currentActions,
      [challengerId]: selectedAction,
    }))
  }

  const confirmTurn = () => {
    if (!gameState || !canResolveTurn(gameState, selectedActions)) {
      return
    }

    setGameState(resolveTurn(gameState, selectedActions))
    setSelectedActions({})
  }

  return createAgniKaiGameViewModel({
    gameState,
    storageWarning,
    challengerInput,
    challengerMaxHealthInput,
    fireMasterHealthMultiplierInput,
    fireMasterHealthAdditionInput,
    selectedActions,
    setChallengerInput,
    setChallengerMaxHealthInput,
    setFireMasterHealthMultiplierInput,
    setFireMasterHealthAdditionInput,
    startGame,
    resetGame,
    confirmTurn,
    updateSelectedAction,
  })
}

export function hasActiveAgniKaiGame(
  game: AgniKaiGameViewModel,
): game is ActiveAgniKaiGameViewModel {
  return game.gameState !== null
}

function getInitialGame(): InitialGame {
  const storedGame = parseStoredGameState(localStorage.getItem(STORAGE_KEY))

  if (storedGame.gameState) {
    return {
      gameState: storedGame.gameState,
      storageWarning: null,
    }
  }

  return {
    gameState: null,
    storageWarning:
      storedGame.errorMessage === 'No saved Agni Kai game was found.'
        ? null
        : storedGame.errorMessage,
  }
}

function createAgniKaiGameViewModel(
  input: AgniKaiGameViewModelInput,
): AgniKaiGameViewModel {
  const canStartGame = canCreateGame(
    input,
  )

  return {
    gameState: input.gameState,
    storageWarning: input.storageWarning,
    challengerInput: input.challengerInput,
    challengerMaxHealthInput: input.challengerMaxHealthInput,
    fireMasterHealthMultiplierInput: input.fireMasterHealthMultiplierInput,
    fireMasterHealthAdditionInput: input.fireMasterHealthAdditionInput,
    canStartGame,
    selectedActions: input.selectedActions,
    activeChallengers: input.gameState
      ? getActiveChallengers(input.gameState)
      : [],
    backupChallengers: input.gameState
      ? getBackupChallengers(input.gameState)
      : [],
    deadChallengers: input.gameState ? getDeadChallengers(input.gameState) : [],
    isTurnReady: input.gameState
      ? canResolveTurn(input.gameState, input.selectedActions)
      : false,
    setChallengerInput: input.setChallengerInput,
    setChallengerMaxHealthInput: input.setChallengerMaxHealthInput,
    setFireMasterHealthMultiplierInput:
      input.setFireMasterHealthMultiplierInput,
    setFireMasterHealthAdditionInput: input.setFireMasterHealthAdditionInput,
    startGame: input.startGame,
    resetGame: input.resetGame,
    confirmTurn: input.confirmTurn,
    updateSelectedAction: input.updateSelectedAction,
  }
}

function canCreateGame(input: {
  challengerInput: string
  challengerMaxHealthInput: string
  fireMasterHealthMultiplierInput: string
  fireMasterHealthAdditionInput: string
}): boolean {
  const challengerCount = Number(input.challengerInput)
  const challengerMaxHealth = Number(input.challengerMaxHealthInput)
  const fireMasterHealthMultiplier = Number(
    input.fireMasterHealthMultiplierInput,
  )
  const fireMasterHealthAddition = Number(input.fireMasterHealthAdditionInput)

  return (
    Number.isInteger(challengerCount) &&
    challengerCount > 0 &&
    Number.isInteger(challengerMaxHealth) &&
    challengerMaxHealth > 0 &&
    Number.isFinite(fireMasterHealthMultiplier) &&
    fireMasterHealthMultiplier > 0 &&
    Number.isInteger(fireMasterHealthAddition) &&
    fireMasterHealthAddition >= 0
  )
}
