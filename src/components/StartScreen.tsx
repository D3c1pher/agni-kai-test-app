import { useRef, useState } from 'react'
import { FireMasterMessageModal } from './FireMasterMessageModal'
import { HowToPlayModal } from './HowToPlayModal'
import { FlameEmblem } from './ui/FlameEmblem'

type StartScreenProps = {
  challengerInput: string
  challengerMaxHealthInput: string
  fireMasterHealthMultiplierInput: string
  fireMasterHealthAdditionInput: string
  canStartGame: boolean
  storageWarning: string | null
  onChallengerInputChange: (value: string) => void
  onChallengerMaxHealthInputChange: (value: string) => void
  onFireMasterHealthMultiplierInputChange: (value: string) => void
  onFireMasterHealthAdditionInputChange: (value: string) => void
  onStartGame: () => void
}

export function StartScreen(props: StartScreenProps) {
  const [isFireMasterMessageOpen, setIsFireMasterMessageOpen] = useState(true)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)
  const fireMasterMessageButtonRef = useRef<HTMLButtonElement>(null)
  const howToPlayButtonRef = useRef<HTMLButtonElement>(null)

  function closeFireMasterMessage() {
    setIsFireMasterMessageOpen(false)
    window.setTimeout(() => fireMasterMessageButtonRef.current?.focus(), 0)
  }

  function closeHowToPlay() {
    setIsHowToPlayOpen(false)
    window.setTimeout(() => howToPlayButtonRef.current?.focus(), 0)
  }

  return (
    <main className="agni-page min-h-dvh px-4 py-6 sm:px-5 sm:py-8">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl flex-col justify-center sm:min-h-[calc(100dvh-4rem)]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <FlameEmblem className="h-16 w-16 shrink-0 drop-shadow-[0_4px_0_#0f0704] sm:h-20 sm:w-20" />
            <div>
              <p className="agni-kicker">Game Prototype</p>
              <h1 className="agni-display mt-2 text-4xl text-[var(--agni-cream)] sm:text-6xl">
                Agni Kai
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--agni-parchment-muted)] sm:mt-5 sm:text-lg sm:leading-8">
            Initiate a duel against the Fire Master.
          </p>
        </div>

        <div className="agni-panel mt-7 max-w-xl p-4 sm:mt-10 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label
              className="block text-sm font-semibold uppercase tracking-wide text-[var(--agni-ink)]"
              htmlFor="challenger-count"
            >
              Total challengers
              <input
                className="agni-input mt-3 w-full px-4 py-3 text-lg"
                id="challenger-count"
                min="1"
                inputMode="numeric"
                type="number"
                value={props.challengerInput}
                onChange={(event) =>
                  props.onChallengerInputChange(event.target.value)
                }
                placeholder="Count"
              />
            </label>
            <label
              className="block text-sm font-semibold uppercase tracking-wide text-[var(--agni-ink)]"
              htmlFor="challenger-health"
            >
              Max health each
              <input
                className="agni-input mt-3 w-full px-4 py-3 text-lg"
                id="challenger-health"
                min="1"
                inputMode="numeric"
                type="number"
                value={props.challengerMaxHealthInput}
                onChange={(event) =>
                  props.onChallengerMaxHealthInputChange(event.target.value)
                }
                placeholder="Health"
              />
            </label>
            <label
              className="block text-sm font-semibold uppercase tracking-wide text-[var(--agni-ink)]"
              htmlFor="fire-master-multiplier"
            >
              Fire Master multiplier
              <input
                className="agni-input mt-3 w-full px-4 py-3 text-lg"
                id="fire-master-multiplier"
                min="0.1"
                inputMode="decimal"
                step="0.1"
                type="number"
                value={props.fireMasterHealthMultiplierInput}
                onChange={(event) =>
                  props.onFireMasterHealthMultiplierInputChange(
                    event.target.value,
                  )
                }
                placeholder="Multiplier"
              />
            </label>
            <label
              className="block text-sm font-semibold uppercase tracking-wide text-[var(--agni-ink)]"
              htmlFor="fire-master-addition"
            >
              Fire Master bonus health
              <input
                className="agni-input mt-3 w-full px-4 py-3 text-lg"
                id="fire-master-addition"
                min="0"
                inputMode="numeric"
                type="number"
                value={props.fireMasterHealthAdditionInput}
                onChange={(event) =>
                  props.onFireMasterHealthAdditionInputChange(
                    event.target.value,
                  )
                }
                placeholder="Bonus"
              />
            </label>
          </div>
          <button
            className="agni-button-primary mt-5 w-full px-4 py-3 text-base"
            disabled={!props.canStartGame}
            type="button"
            onClick={props.onStartGame}
          >
            Play
          </button>
          <button
            className="agni-button-secondary mt-3 w-full px-4 py-3 text-base"
            ref={howToPlayButtonRef}
            type="button"
            onClick={() => setIsHowToPlayOpen(true)}
          >
            How to Play
          </button>
          <button
            className="agni-button-secondary mt-3 w-full px-4 py-3 text-base"
            ref={fireMasterMessageButtonRef}
            type="button"
            onClick={() => setIsFireMasterMessageOpen(true)}
          >
            Message from the Fire Master
          </button>
          {props.storageWarning ? (
            <p className="mt-4 border-l-4 border-[var(--agni-rust)] bg-[rgba(152,47,16,0.1)] px-3 py-2 text-sm leading-6 text-[var(--agni-rust-dark)]">
              {props.storageWarning} Start a new duel to replace it.
            </p>
          ) : null}
        </div>
      </section>
      {isFireMasterMessageOpen ? (
        <FireMasterMessageModal onClose={closeFireMasterMessage} />
      ) : null}
      {isHowToPlayOpen ? (
        <HowToPlayModal onClose={closeHowToPlay} />
      ) : null}
    </main>
  )
}
