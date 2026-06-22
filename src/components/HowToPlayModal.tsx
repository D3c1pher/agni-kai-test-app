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
      <div className="agni-how-to-play-panel mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-700">
              Agni Kai Trial | Duel Prototype
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-normal"
              id="how-to-play-title"
            >
              How to Play
            </h2>
          </div>
          <button
            aria-label="Close how to play"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-red-200"
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

        <div className="overflow-y-auto px-6 py-6">
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
              <p className="mt-3 rounded-md bg-slate-100 px-4 py-3 font-mono text-sm font-semibold text-slate-800">
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
                  previous turn, and only one challenger may use Lightning per
                  turn.
                </ActionRule>
                <ActionRule name="Read">
                  Reveal one upcoming Fire Master move. Multiple readers can
                  reveal more moves, up to three revealed moves at a time.
                </ActionRule>
              </div>
            </GuideSection>

            <GuideSection title="Fire Master Actions">
              <div className="space-y-3">
                <ActionRule name="Strike">
                  Deal 1 damage to every active challenger who did not Guard.
                </ActionRule>
                <ActionRule name="Guard">
                  Block all damage from challenger attacks that turn.
                </ActionRule>
                <ActionRule name="Charge">
                  Deal no damage and signal that Lightning may be coming later.
                </ActionRule>
                <ActionRule name="Lightning">
                  Deal 3 damage to all active challengers unless at least two
                  active challengers Guard.
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
                  Fire Master Guard blocks both Strike and Lightning damage.
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
      <h3 className="text-lg font-bold text-slate-950">{props.title}</h3>
      <div className="mt-3 text-sm leading-6 text-slate-700">
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
    <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <strong className="text-slate-950">{props.name}</strong> -{' '}
      {props.children}
    </p>
  )
}
