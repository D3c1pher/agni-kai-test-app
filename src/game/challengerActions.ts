import { FIRE_MASTER_RECOVERY, PLAYER_ACTIONS } from './gameConstants'
import type {
  Challenger,
  ChallengerAction,
  ChallengerActionSelections,
  FireMasterAction,
} from './types'

export function getLegalChallengerActions(
  challenger: Challenger,
): ChallengerAction[] {
  return PLAYER_ACTIONS.filter((action) => {
    if (action === 'Guard') {
      return challenger.previousAction !== 'Guard'
    }

    if (action === 'Lightning') {
      return challenger.hasLightningCharge
    }

    return true
  })
}

export type PlayerDamageResolution = {
  incomingDamage: number
  appliedDamage: number
  blockedChallengerId: number | null
}

export function resolvePlayerDamage(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
  isFireMasterGuarding: boolean,
  random: () => number = Math.random,
): PlayerDamageResolution {
  const challengerDamage = activeChallengers.map((challenger) => ({
    challengerId: challenger.id,
    damage: getChallengerDamage(selections[challenger.id]),
  }))
  const incomingDamage = challengerDamage.reduce(
    (totalDamage, attack) => totalDamage + attack.damage,
    0,
  )

  if (!isFireMasterGuarding || incomingDamage === 0) {
    return {
      incomingDamage,
      appliedDamage: incomingDamage,
      blockedChallengerId: null,
    }
  }

  const highestDamage = Math.max(
    ...challengerDamage.map((attack) => attack.damage),
  )
  const highestDamageAttackers = challengerDamage.filter(
    (attack) => attack.damage === highestDamage,
  )
  const blockedAttackIndex = Math.floor(random() * highestDamageAttackers.length)
  const blockedAttack = highestDamageAttackers[blockedAttackIndex]

  return {
    incomingDamage,
    appliedDamage: incomingDamage - blockedAttack.damage,
    blockedChallengerId: blockedAttack.challengerId,
  }
}

export function countReaders(
  activeChallengers: Challenger[],
  selections: ChallengerActionSelections,
): number {
  return activeChallengers.filter(
    (challenger) => selections[challenger.id] === 'Read',
  ).length
}

export function getRecoveryAmount(
  fireMasterHealth: number,
  playerDamage: number,
  fireMasterMaxHealth: number,
  fireMasterAction: FireMasterAction,
): number {
  if (fireMasterAction !== 'Recover') {
    return 0
  }

  const fireMasterHealthAfterDamage = Math.max(
    0,
    fireMasterHealth - playerDamage,
  )

  if (fireMasterHealthAfterDamage <= 0) {
    return 0
  }

  return Math.min(
    FIRE_MASTER_RECOVERY,
    fireMasterMaxHealth - fireMasterHealthAfterDamage,
  )
}

function getChallengerDamage(action: ChallengerAction): number {
  if (action === 'Lightning') {
    return 3
  }

  if (action === 'Strike') {
    return 1
  }

  return 0
}
