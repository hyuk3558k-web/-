import { HOMEWORK_TEMPLATES } from '../data/homeworkTemplates'
import { SCHEDULES } from '../data/schedules'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function generateHomeworkForDate(childId, date) {
  const dayIndex = date.getDay()
  const dayKey = DAY_KEYS[dayIndex]
  if (dayKey === 'sun') return []

  const template = HOMEWORK_TEMPLATES[childId]
  if (!template) return []

  const items = []
  let idCounter = 1

  // 1. Daily required homework
  if (template.daily) {
    template.daily.forEach(hw => {
      items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
    })
  }

  // 2. Before-academy homework: check if TOMORROW has that academy
  const tomorrowDate = new Date(date)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowDayKey = DAY_KEYS[tomorrowDate.getDay()]
  const tomorrowSchedule = SCHEDULES[childId]?.[tomorrowDayKey] || []

  if (template.beforeAcademy) {
    Object.entries(template.beforeAcademy).forEach(([academyLabel, hwList]) => {
      const hasTomorrow = tomorrowSchedule.some(
        block => block.type === 'academy' && block.label.includes(academyLabel.replace('학원', ''))
      )
      if (hasTomorrow) {
        hwList.forEach(hw => {
          items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
        })
      }
    })
  }

  // 3. Optional homework (always include, mark as optional)
  if (template.optional) {
    template.optional.forEach(hw => {
      items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
    })
  }

  return items
}
