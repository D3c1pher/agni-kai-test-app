import { MAX_ACTIVE_CHALLENGERS } from './gameConstants'
import type {
  Challenger,
  ChallengerActionSelections,
  FireMasterAction,
} from './types'

export function applyPlayerActionState(
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

export function applyFireMasterAction(
  challengers: Challenger[],
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
  fireMasterAction: FireMasterAction,
): Challenger[] {
  if (fireMasterAction === 'Strike') {
    return applyStrikeDamage(challengers, activeChallengers, selections)
  }

  if (fireMasterAction === 'Lightning') {
    return applyLightningDamage(challengers, activeChallengers, selections)
  }

  return challengers
}

export function refillActiveChallengers(
  challengers: Challenger[],
): Challenger[] {
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

function applyStrikeDamage(
  challengers: Challenger[],
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): Challenger[] {
  const damagedIds = new Set(
    activeChallengers
      .filter((challenger) => selections[challenger.id] !== 'Guard')
      .map((challenger) => challenger.id),
  )

  return challengers.map((challenger) =>
    damagedIds.has(challenger.id) ? damageChallenger(challenger, 1) : challenger,
  )
}

function applyLightningDamage(
  challengers: Challenger[],
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): Challenger[] {
  const guardCount = activeChallengers.filter(
    (challenger) => selections[challenger.id] === 'Guard',
  ).length

  if (guardCount >= 2) {
    return challengers
  }

  const damagedIds = new Set(
    activeChallengers.map((challenger) => challenger.id),
  )

  return challengers.map((challenger) =>
    damagedIds.has(challenger.id) ? defeatChallenger(challenger) : challenger,
  )
}

function defeatChallenger(challenger: Challenger): Challenger {
  return {
    ...challenger,
    health: 0,
    isActive: false,
  }
}

function damageChallenger(challenger: Challenger, damage: number): Challenger {
  const health = Math.max(0, challenger.health - damage)

  return {
    ...challenger,
    health,
    isActive: health > 0 && challenger.isActive,
  }
}
