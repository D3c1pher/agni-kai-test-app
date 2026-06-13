import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  STORAGE_KEY,
  canResolveTurn,
  createGameState,
  getActiveChallengers,
  getBackupChallengers,
  getDeadChallengers,
  getLegalChallengerActions,
  parseStoredGameState,
  resolveTurn,
  serializeGameState,
} from './game/agniKaiRules'
import type {
  Challenger,
  ChallengerAction,
  ChallengerActionSelections,
  GameState,
} from './game/agniKaiRules'

type InitialGame = {
  gameState: GameState | null
  storageWarning: string | null
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

function App() {
  const initialGame = useMemo(getInitialGame, [])
  const [gameState, setGameState] = useState<GameState | null>(
    initialGame.gameState,
  )
  const [storageWarning, setStorageWarning] = useState<string | null>(
    initialGame.storageWarning,
  )
  const [challengerInput, setChallengerInput] = useState('')
  const [selectedActions, setSelectedActions] = useState<
    Partial<ChallengerActionSelections>
  >({})

  useEffect(() => {
    if (!gameState) {
      return
    }

    localStorage.setItem(STORAGE_KEY, serializeGameState(gameState))
  }, [gameState])

  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') {
      return
    }

    setSelectedActions({})
  }, [gameState?.turn, gameState?.status])

  const challengerCount = Number(challengerInput)
  const canStartGame =
    Number.isInteger(challengerCount) && challengerCount > 0

  const startGame = () => {
    if (!canStartGame) {
      return
    }

    setStorageWarning(null)
    setGameState(createGameState(challengerCount))
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
    setSelectedActions((currentActions) => {
      if (selectedAction !== 'Lightning') {
        return {
          ...currentActions,
          [challengerId]: selectedAction,
        }
      }

      const nextActions: Partial<ChallengerActionSelections> = {}

      Object.entries(currentActions).forEach(([currentChallengerId, action]) => {
        if (action !== 'Lightning') {
          nextActions[Number(currentChallengerId)] = action
        }
      })

      return {
        ...nextActions,
        [challengerId]: selectedAction,
      }
    })
  }

  const confirmTurn = () => {
    if (!gameState || !canResolveTurn(gameState, selectedActions)) {
      return
    }

    setGameState(resolveTurn(gameState, selectedActions))
  }

  if (!gameState) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] px-5 py-8 text-slate-950">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              Duel prototype
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-normal sm:text-6xl">
              Agni Kai
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Set the total challengers, then test the turn-by-turn duel against
              the Fire Master.
            </p>
          </div>

          <div className="mt-10 max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="challenger-count"
            >
              Total challengers
            </label>
            <input
              className="mt-3 w-full rounded-md border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              id="challenger-count"
              min="1"
              inputMode="numeric"
              type="number"
              value={challengerInput}
              onChange={(event) => setChallengerInput(event.target.value)}
              placeholder="Enter a number"
            />
            <button
              className="mt-5 w-full rounded-md bg-red-700 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              disabled={!canStartGame}
              type="button"
              onClick={startGame}
            >
              Play
            </button>
            {storageWarning ? (
              <p className="mt-4 text-sm leading-6 text-amber-700">
                {storageWarning} Start a new duel to replace it.
              </p>
            ) : null}
          </div>
        </section>
      </main>
    )
  }

  const activeChallengers = getActiveChallengers(gameState)
  const backupChallengers = getBackupChallengers(gameState)
  const deadChallengers = getDeadChallengers(gameState)
  const isTurnReady = canResolveTurn(gameState, selectedActions)

  return (
    <main className="h-screen overflow-hidden bg-[#f6f7fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex h-full max-w-7xl flex-col">
        <header className="flex shrink-0 flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Agni Kai
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-800">
              Turn {gameState.turn}
            </div>
          <button
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-700 md:w-auto"
            type="button"
            onClick={resetGame}
          >
            Reset duel
          </button>
          </div>
        </header>

        {gameState.status !== 'playing' ? (
          <section
            className={`mt-6 rounded-lg border p-5 ${
              gameState.status === 'won'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-red-200 bg-red-50 text-red-950'
            }`}
          >
            <h2 className="text-2xl font-bold">
              {gameState.status === 'won'
                ? 'The challengers win'
                : 'The Fire Master wins'}
            </h2>
            <p className="mt-2 text-sm leading-6">
              {gameState.status === 'won'
                ? 'The Fire Master has been reduced to 0 health.'
                : 'All challengers have fallen.'}
            </p>
          </section>
        ) : null}

        <section className="mt-3 grid min-h-0 flex-[0_0_45%] gap-3 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
                  Fire Master
                </p>
                <h2 className="mt-1 text-xl font-bold">AI opponent</h2>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                Pattern hidden
              </span>
            </div>
            <div className="mt-4">
              <HealthBar
                currentHealth={gameState.fireMaster.health}
                label="Fire Master health"
                maxHealth={gameState.fireMaster.maxHealth}
                tone="red"
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat
                label="Last action"
                value={gameState.fireMaster.lastAction ?? 'None yet'}
              />
              <Stat
                label="Pattern step"
                value={`${gameState.fireMaster.moveIndex + 1} / 4`}
              />
            </dl>
          </div>

          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Active challengers
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Choose each action
                </h2>
              </div>
              <button
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                disabled={!isTurnReady}
                type="button"
                onClick={confirmTurn}
              >
                Confirm actions
              </button>
            </div>

            <div className="mt-3 grid min-h-0 flex-1 gap-3 xl:grid-cols-3">
              {activeChallengers.map((challenger) => (
                <ChallengerPanel
                  challenger={challenger}
                  key={challenger.id}
                  selectedActions={selectedActions}
                  onActionChange={updateSelectedAction}
                />
              ))}
            </div>

            {activeChallengers.length === 0 ? (
              <p className="mt-5 rounded-md bg-slate-100 p-4 text-sm text-slate-600">
                No active challengers remain.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">Roster</h2>
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto pr-1">
              <RosterGroup challengers={backupChallengers} label="Backup" />
              <RosterGroup challengers={deadChallengers} label="Defeated" />
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">Read results</h2>
            {gameState.revealedMoves.length > 0 ? (
              <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
                {gameState.revealedMoves.map((move, moveIndex) => (
                  <li
                    className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-950"
                    key={`${move.turn}-${move.patternName}-${move.action}-${moveIndex}`}
                  >
                    Turn {move.turn}: {move.action} from {move.patternName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Use Read with active challengers to reveal upcoming Fire Master
                moves.
              </p>
            )}
          </div>

          <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">Turn log</h2>
            <ol className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {gameState.turnLog.map((entry) => (
                <li
                  className="rounded-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700"
                  key={entry}
                >
                  {entry}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </section>
    </main>
  )
}

function ChallengerPanel(props: {
  challenger: Challenger
  selectedActions: Partial<ChallengerActionSelections>
  onActionChange: (challengerId: number, action: ChallengerAction) => void
}) {
  const legalActions = getLegalChallengerActions(
    props.challenger,
    props.selectedActions,
  )
  const selectedAction = props.selectedActions[props.challenger.id] ?? ''

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold">Challenger {props.challenger.id}</h3>
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
    </article>
  )
}

function HealthBar(props: {
  currentHealth: number
  label: string
  maxHealth: number
  tone: 'amber' | 'red'
}) {
  const healthPercent =
    props.maxHealth > 0 ? (props.currentHealth / props.maxHealth) * 100 : 0
  const barColor = props.tone === 'red' ? 'bg-red-600' : 'bg-amber-500'

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{props.label}</span>
        <span className="font-bold text-slate-950">
          {props.currentHealth} / {props.maxHealth}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {props.label}
      </dt>
      <dd className="mt-1 font-bold text-slate-950">{props.value}</dd>
    </div>
  )
}

function RosterGroup(props: { challengers: Challenger[]; label: string }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {props.label}
      </h3>
      {props.challengers.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {props.challengers.map((challenger) => (
            <span
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
              key={challenger.id}
            >
              C{challenger.id} {challenger.health}/{challenger.maxHealth}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">None</p>
      )}
    </div>
  )
}

export default App
