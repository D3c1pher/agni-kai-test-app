import { useCallback, useEffect, useRef, useState } from 'react'
import fireMasterAvatar from '../assets/fire-master-norven.jpg'

const CLOSE_ANIMATION_DURATION_MS = 160

type FireMasterMessageModalProps = {
  onClose: () => void
}

export function FireMasterMessageModal(props: FireMasterMessageModalProps) {
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
      aria-labelledby="fire-master-message-title"
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
              A message from your Fire Master
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-normal"
              id="fire-master-message-title"
            >
              Thank You, Campers!
            </h2>
          </div>
          <button
            aria-label="Close message from the Fire Master"
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
          <div className="space-y-5 text-sm leading-7 text-slate-700 sm:text-base">
            <p>
              To the <strong className="text-slate-950">Thrive As One Campers</strong>{' '}
              who experienced the{' '}
              <strong className="text-red-700">Agni Kai Trial</strong> during the{' '}
              <strong className="text-slate-950">Trials of the Elements</strong>{' '}
              activity:
            </p>

            <p className="text-lg font-bold text-slate-950">Thank you for playing!</p>

            <p>
              It was a joy seeing you face the challenge together with your
              tribes. I hope the game gave you a fun and memorable experience
              during camp, and I’m grateful that I got to be part of your
              Amazing Race experience.
            </p>

            <p>
              I hope you enjoy this digital version of the game and get to test
              what you could have done differently during the trial. I’ll keep
              updating it from time to time, so feel free to play again.
            </p>

            <p>
              Also, shoutout to the{' '}
              <strong className="text-red-700">Flamethrowers Tribe</strong> for
              that dominating win!
            </p>

            <p>
              May we continue to{' '}
              <strong className="text-slate-950">THRIVE AS ONE!</strong>
            </p>

            <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
              <img
                alt="Norven, the Fire Master"
                className="h-20 w-20 shrink-0 rounded-full border-2 border-red-100 object-cover shadow-sm"
                src={fireMasterAvatar}
              />
              <p className="leading-6 text-slate-700">
                From Yours Truly,
                <br />
                <strong className="text-slate-950">
                  Norven '<span className="text-[#199efc]">Inspired Weaver</span>'{' '}
                  Caracas
                </strong>
                <br />
                Your Fire Master
              </p>
            </div>

            <div className="space-y-2">
              <p>
                If you want to follow my game development stuff, you can follow me here.
                I'll be posting game development updates again soon.
              </p>
              <p className="flex flex-wrap gap-3 pt-1">
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-[#1877f2]/30 px-3 py-2 font-semibold text-[#1877f2] transition hover:bg-[#1877f2]/10 focus:outline-none focus:ring-2 focus:ring-[#1877f2]/40"
                  href="https://www.facebook.com/profile.php?id=61581950243209"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
                  </svg>
                  Facebook
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-black/30 px-3 py-2 font-semibold text-black transition hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/40"
                  href="https://x.com/InspiredWeaver"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.09 17.84h1.73L8.43 4.05H6.58l11.23 15.79Z" />
                  </svg>
                  Twitter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}
