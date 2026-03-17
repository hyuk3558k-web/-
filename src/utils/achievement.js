export function calcAchievement(homeworkItems) {
  if (!homeworkItems || homeworkItems.length === 0) return null
  const requiredItems = homeworkItems.filter(item => item.required)
  if (requiredItems.length === 0) return null
  const completed = requiredItems.filter(item => item.completed).length
  return Math.round((completed / requiredItems.length) * 100)
}

export function calcBonusCount(homeworkItems) {
  if (!homeworkItems) return 0
  return homeworkItems.filter(item => !item.required && item.completed).length
}

export function getAchievementColor(rate) {
  if (rate === null) return 'transparent'
  if (rate >= 90) return '#22C55E'  // green
  if (rate >= 50) return '#EAB308'  // yellow
  return '#EF4444'                   // red
}
