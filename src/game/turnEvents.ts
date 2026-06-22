import type {
  Challenger,
  ChallengerActionSelections,
  FireMasterAction,
  TurnEvent,
} from './types'

type TurnEventDetails = {
  activeChallengers: Challenger[]
  selections: ChallengerActionSelections
  fireMasterAction: FireMasterAction
  blockedChallengerId: number | null
  playerDamage: number
  recoveryAmount: number
  readCount: number
  revealedReadCount: number
  challengersBefore: Challenger[]
  challengersAfter: Challenger[]
}

export function createTurnEvents(details: TurnEventDetails): TurnEvent[] {
  const playerEvents = createPlayerActionEvents(
    details.activeChallengers,
    details.selections,
  )
  const fireMasterBlockEvents =
    details.blockedChallengerId !== null
      ? [
          {
            type: 'blocked',
            target: 'fireMaster',
            challengerId: details.blockedChallengerId,
          } satisfies TurnEvent,
        ]
      : []
  const fireMasterDamageEvents =
    details.playerDamage > 0
      ? [
          {
            type: 'damage',
            target: 'fireMaster',
            amount: details.playerDamage,
          } satisfies TurnEvent,
        ]
      : []
  const recoveryEvents =
    details.recoveryAmount > 0
      ? [{ type: 'recover', amount: details.recoveryAmount } satisfies TurnEvent]
      : []
  const challengerDamageEvents = createChallengerDamageEvents(
    details.challengersBefore,
    details.challengersAfter,
  )
  const challengerBlockEvents = createChallengerBlockEvents(
    details.activeChallengers,
    details.selections,
    details.fireMasterAction,
  )
  const readEvents =
    details.revealedReadCount > 0
      ? [{ type: 'read', count: details.revealedReadCount } satisfies TurnEvent]
      : []
  const readBlockedEvents =
    details.readCount > 0 && details.revealedReadCount === 0
      ? [{ type: 'readBlocked' } satisfies TurnEvent]
      : []

  return [
    ...playerEvents,
    ...fireMasterBlockEvents,
    ...fireMasterDamageEvents,
    ...recoveryEvents,
    ...challengerDamageEvents,
    ...challengerBlockEvents,
    ...readEvents,
    ...readBlockedEvents,
  ]
}

export function getFireMasterEvents(events: TurnEvent[]): TurnEvent[] {
  return events.filter((event) => {
    if (event.type === 'recover') {
      return true
    }

    return 'target' in event && event.target === 'fireMaster'
  })
}

export function getChallengerEvents(
  challengerId: number,
  events: TurnEvent[],
): TurnEvent[] {
  return events.filter((event) => {
    return 'challengerId' in event && event.challengerId === challengerId
  })
}

export function hasReadEvent(events: TurnEvent[]): boolean {
  return events.some(
    (event) => event.type === 'read' || event.type === 'readBlocked',
  )
}

export function hasReadBlockedEvent(events: TurnEvent[]): boolean {
  return events.some((event) => event.type === 'readBlocked')
}

function createPlayerActionEvents(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): TurnEvent[] {
  return activeChallengers.flatMap((challenger) => {
    const selectedAction = selections[challenger.id]

    if (selectedAction === 'Charge') {
      return [{ type: 'charge', challengerId: challenger.id }]
    }

    return []
  })
}

function createChallengerDamageEvents(
  challengersBefore: Challenger[],
  challengersAfter: Challenger[],
): TurnEvent[] {
  return challengersAfter.flatMap((challenger) => {
    const previousChallenger = challengersBefore.find(
      (beforeChallenger) => beforeChallenger.id === challenger.id,
    )

    if (!previousChallenger || previousChallenger.health <= challenger.health) {
      return []
    }

    return [
      {
        type: 'damage',
        target: 'challenger',
        challengerId: challenger.id,
        amount: previousChallenger.health - challenger.health,
      } satisfies TurnEvent,
    ]
  })
}

function createChallengerBlockEvents(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
  fireMasterAction: FireMasterAction,
): TurnEvent[] {
  if (fireMasterAction === 'Strike') {
    return activeChallengers
      .filter((challenger) => selections[challenger.id] === 'Guard')
      .map((challenger) => ({
        type: 'blocked',
        target: 'challenger',
        challengerId: challenger.id,
      }))
  }

  if (fireMasterAction === 'Lightning') {
    const guardingChallengers = activeChallengers.filter(
      (challenger) => selections[challenger.id] === 'Guard',
    )

    if (guardingChallengers.length < 2) {
      return []
    }

    return guardingChallengers.map((challenger) => ({
      type: 'blocked',
      target: 'challenger',
      challengerId: challenger.id,
    }))
  }

  return []
}
