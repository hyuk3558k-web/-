export async function sendTelegramMessage(botToken, chatId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  })
  return response.json()
}

export function buildAchievementMessage(childrenData, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  let msg = `📊 <b>오늘의 달성률 요약</b> (${dateStr})\n━━━━━━━━━━━━━━━━\n`

  let totalRate = 0
  let count = 0

  for (const child of childrenData) {
    const emoji = child.colorEmoji || '⚪'
    const rate = child.achievement
    const completed = child.completed
    const total = child.total
    let indicator = ''
    if (rate === 100) indicator = ' ⭐'
    else if (rate !== null && rate < 50) indicator = ' ⚠️'

    if (rate !== null) {
      msg += `${emoji} ${child.name}: ${rate}% (${completed}/${total} 완료)${indicator}\n`
      totalRate += rate
      count++
    } else {
      msg += `${emoji} ${child.name}: 숙제 없음\n`
    }
  }

  msg += `━━━━━━━━━━━━━━━━\n`
  if (count > 0) {
    msg += `전체 평균: ${Math.round(totalRate / count)}%`
  }

  return msg
}
