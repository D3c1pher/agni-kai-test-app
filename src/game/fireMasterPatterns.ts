import type { FireMasterAction } from './agniKaiRules'

export type FireMasterPattern = {
  id: string
  name: string
  moves: readonly FireMasterAction[]
}

export const FIRE_MASTER_PATTERNS = [
  {
    id: 'relentless-flame',
    name: 'Relentless Flame',
    moves: ['Strike', 'Strike', 'Guard', 'Strike'],
  },
  {
    id: 'breathing-ember',
    name: 'Breathing Ember',
    moves: ['Strike', 'Recover', 'Strike', 'Guard'],
  },
  {
    id: 'iron-stance',
    name: 'Iron Stance',
    moves: ['Guard', 'Strike', 'Guard', 'Recover'],
  },
  {
    id: 'burning-rhythm',
    name: 'Burning Rhythm',
    moves: ['Strike', 'Guard', 'Strike', 'Recover'],
  },
  {
    id: 'gathering-storm',
    name: 'Gathering Storm',
    moves: ['Strike', 'Charge', 'Lightning', 'Guard'],
  },
  {
    id: 'false-spark',
    name: 'False Spark',
    moves: ['Strike', 'Charge', 'Guard', 'Recover'],
  },
] as const satisfies readonly FireMasterPattern[]
