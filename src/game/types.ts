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
  queuedPatternId?: string
}

export type FireMasterPattern = {
  id: string
  name: string
  moves: readonly FireMasterAction[]
}

export type RevealedMove = {
  turn: number
  patternName?: string
  action: FireMasterAction
}

export type TurnEvent =
  | {
      type: 'damage'
      target: 'fireMaster'
      amount: number
    }
  | {
      type: 'damage'
      target: 'challenger'
      challengerId: number
      amount: number
    }
  | {
      type: 'blocked'
      target: 'fireMaster'
      challengerId?: number
    }
  | {
      type: 'blocked'
      target: 'challenger'
      challengerId: number
    }
  | {
      type: 'charge'
      challengerId: number
    }
  | {
      type: 'recover'
      amount: number
    }
  | {
      type: 'read'
      count: number
    }
  | {
      type: 'readBlocked'
    }

export type GameState = {
  status: GameStatus
  turn: number
  challengers: Challenger[]
  fireMaster: FireMasterState
  revealedMoves: RevealedMove[]
  recentEvents: TurnEvent[]
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
