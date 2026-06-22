import type { TurnEvent } from '../game/agniKaiRules'

export function getFireMasterFeedbackClass(events: TurnEvent[]): string {
  if (events.some((event) => event.type === 'recover')) {
    return 'agni-recover-pulse'
  }

  if (
    events.some(
      (event) => event.type === 'damage' && event.target === 'fireMaster',
    )
  ) {
    return 'agni-hit-flash'
  }

  if (
    events.some(
      (event) => event.type === 'blocked' && event.target === 'fireMaster',
    )
  ) {
    return 'agni-guard-pulse'
  }

  return ''
}

export function getChallengerFeedbackClass(
  challengerId: number,
  events: TurnEvent[],
): string {
  if (
    events.some(
      (event) =>
        event.type === 'damage' &&
        event.target === 'challenger' &&
        event.challengerId === challengerId,
    )
  ) {
    return 'agni-hit-shake'
  }

  if (
    events.some(
      (event) =>
        event.type === 'blocked' &&
        event.challengerId === challengerId,
    )
  ) {
    return 'agni-guard-pulse'
  }

  if (
    events.some(
      (event) => event.type === 'charge' && event.challengerId === challengerId,
    )
  ) {
    return 'agni-charge-glow'
  }

  return ''
}

export function getEventLabel(event: TurnEvent): string {
  if (event.type === 'damage') {
    return `-${event.amount} HP`
  }

  if (event.type === 'blocked') {
    return 'Blocked'
  }

  if (event.type === 'charge') {
    return 'Charged'
  }

  if (event.type === 'recover') {
    return `+${event.amount} HP`
  }

  if (event.type === 'readBlocked') {
    return 'Unable to read'
  }

  return `Read x${event.count}`
}

export function getEventPillClass(event: TurnEvent): string {
  if (event.type === 'damage') {
    return 'bg-red-100 text-red-800'
  }

  if (event.type === 'blocked') {
    return 'bg-sky-100 text-sky-800'
  }

  if (event.type === 'charge') {
    return 'bg-amber-100 text-amber-800'
  }

  if (event.type === 'recover') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (event.type === 'readBlocked') {
    return 'bg-slate-200 text-slate-700'
  }

  return 'bg-violet-100 text-violet-800'
}
