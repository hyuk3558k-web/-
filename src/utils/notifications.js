import { calcAchievement } from './achievement'

// Request browser notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') return true

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Check if notification permission is granted
export function isNotificationEnabled() {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Send a browser notification
function sendNotification(title, body) {
  if (!isNotificationEnabled()) return

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'homework-reminder',
    renotify: true
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

// Check achievement and send notification if below 50%
export function checkAndNotify(childName, homeworkItems) {
  const achievement = calcAchievement(homeworkItems)
  if (achievement !== null && achievement < 50) {
    sendNotification(
      `${childName} 숙제 알림`,
      `오늘 숙제 달성률이 ${achievement}%예요. 아직 할 숙제가 남았어요! 화이팅!`
    )
    return true
  }
  return false
}

// Start periodic check (runs every 30 minutes after 7 PM)
let checkInterval = null

export function startAchievementMonitor(getHomeworkData) {
  if (checkInterval) return

  const doCheck = () => {
    const now = new Date()
    const hour = now.getHours()

    // Only notify between 7 PM and 10 PM
    if (hour >= 19 && hour < 22) {
      const data = getHomeworkData()
      if (data) {
        data.forEach(({ childName, items }) => {
          checkAndNotify(childName, items)
        })
      }
    }
  }

  // Check immediately
  doCheck()

  // Then check every 30 minutes
  checkInterval = setInterval(doCheck, 30 * 60 * 1000)
}

export function stopAchievementMonitor() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}
