import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const CLOSE_ANIMATION_DURATION_MS = 160

type HowToPlayModalProps = {
  onClose: () => void
}

export function HowToPlayModal(props: HowToPlayModalProps) {
  const { onClose } = props
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const closeModal = useCallback(() => {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    const closeDelay = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : CLOSE_ANIMATION_DURATION_MS

    closeTimeoutRef.current = window.setTimeout(() => {
      dialogRef.current?.close()
      onClose()
    }, closeDelay)
  }, [isClosing, onClose])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog || dialog.open) {
      return
    }

    dialog.showModal()

    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
      }

      dialog.close()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      closeModal()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeModal])

  return (
    <dialog
      aria-labelledby="how-to-play-title"
      className={`agni-how-to-play-dialog ${isClosing ? 'is-closing' : ''}`}
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        closeModal()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal()
        }
      }}
    >
      <div className="agni-how-to-play-panel agni-panel mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[calc(100dvh-2rem)]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b-2 border-[var(--agni-rust-dark)] bg-[var(--agni-rust)] px-4 py-4 text-[var(--agni-cream)] sm:gap-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--agni-gold)]">
              Agni Kai Trial | Prototype
            </p>
            <h2
              className="agni-display mt-2 text-2xl sm:text-3xl"
              id="how-to-play-title"
            >
              How to Play
            </h2>
          </div>
          <button
            aria-label="Close how to play"
            className="agni-icon-button p-2"
            type="button"
            onClick={closeModal}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </header>

        <div className="agni-scrollbar overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="space-y-8">
            <GuideSection title="Objective">
              <p>
                You control a group of challengers. Reduce the Fire Master to 0
                health before every challenger falls.
              </p>
            </GuideSection>

            <GuideSection title="Setup">
              <p>
                Choose the total challengers, each challenger&apos;s maximum
                health, the Fire Master health multiplier, and any bonus health.
                You can change all four values before starting the duel.
              </p>
              <p className="mt-3 border border-[var(--agni-border)] bg-[var(--agni-cream)] px-4 py-3 text-sm font-semibold text-[var(--agni-ink)]">
                Fire Master health = (challengers x health each x multiplier) +
                bonus
              </p>
            </GuideSection>

            <GuideSection title="How the Duel Works">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Up to three challengers fight at the same time.</li>
                <li>Choose one action for every active challenger.</li>
                <li>
                  Select Confirm actions to reveal and resolve the turn.
                </li>
                <li>
                  The Fire Master follows a hidden preset action pattern.
                </li>
                <li>
                  Fallen challengers are automatically replaced by the next
                  available challengers.
                </li>
                <li>
                  Continue until the Fire Master reaches 0 health or all
                  challengers have fallen.
                </li>
              </ol>
            </GuideSection>

            <GuideSection title="Challenger Actions">
              <div className="space-y-3">
                <ActionRule name="Strike">Deal 1 damage.</ActionRule>
                <ActionRule name="Guard">
                  Block a Fire Master Strike and help the team defend against
                  Lightning.
                </ActionRule>
                <ActionRule name="Charge">
                  Prepare Lightning for the immediately following turn.
                </ActionRule>
                <ActionRule name="Lightning">
                  Deal 3 damage. The challenger must have Charged on the
                  previous turn. Any number of charged challengers may use
                  Lightning on the same turn.
                </ActionRule>
                <ActionRule name="Read">
                  Reveal one upcoming Fire Master move. Multiple readers can
                  reveal more moves, up to 3 revealed moves at a time.
                </ActionRule>
              </div>
            </GuideSection>

            <GuideSection title="Fire Master Actions">
              <div className="space-y-3">
                <ActionRule name="Strike">
                  Deal 1 damage to every active challenger who did not Guard.
                </ActionRule>
                <ActionRule name="Guard">
                  Block one attacking challenger. The highest-damage attack is
                  blocked; ties are resolved randomly.
                </ActionRule>
                <ActionRule name="Charge">
                  Deal no damage and signal that Lightning may be coming later.
                </ActionRule>
                <ActionRule name="Lightning">
                  Defeat every active challenger unless at least two active
                  challengers Guard.
                </ActionRule>
                <ActionRule name="Recover">
                  Restore up to 2 health without exceeding maximum health.
                </ActionRule>
              </div>
            </GuideSection>

            <GuideSection title="Additional Rules">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  The same challenger cannot Guard on two consecutive turns.
                </li>
                <li>
                  Fire Master Guard can block either Strike or Lightning, but
                  only from one challenger each turn.
                </li>
                <li>
                  If two or more challengers Guard against Fire Master
                  Lightning, the entire active group is protected.
                </li>
              </ul>
            </GuideSection>
          </div>
        </div>
      </div>
    </dialog>
  )
}

type GuideSectionProps = {
  title: string
  children: ReactNode
}

function GuideSection(props: GuideSectionProps) {
  return (
    <section>
      <h3 className="agni-display text-lg text-[var(--agni-ink)]">{props.title}</h3>
      <div className="mt-3 text-sm leading-6 text-[var(--agni-ink-muted)]">
        {props.children}
      </div>
    </section>
  )
}

type ActionRuleProps = {
  name: string
  children: ReactNode
}

function ActionRule(props: ActionRuleProps) {
  return (
    <p className="border border-[var(--agni-border)] bg-[var(--agni-cream)] px-4 py-3">
      <strong className="font-semibold uppercase tracking-wide text-[var(--agni-rust-dark)]">{props.name}</strong> -{' '}
      {props.children}
    </p>
  )
}
