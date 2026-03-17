import { SCHEDULES } from '../data/schedules'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function useSchedule(childId, date) {
  const dayKey = DAY_KEYS[date.getDay()]
  const blocks = SCHEDULES[childId]?.[dayKey] || []
  return { blocks, dayKey }
}
