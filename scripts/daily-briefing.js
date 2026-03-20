/**
 * Daily Telegram Briefing Script
 * Reads today's homework data from Firestore for each child,
 * calculates achievement rates, and sends a summary via Telegram.
 *
 * Usage: node scripts/daily-briefing.js
 * Schedule via Windows Task Scheduler at 19:00 daily.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBNfH85KnUnov_8uFVRZxQb4TYDGSnxmMs",
  authDomain: "seo-timetable.firebaseapp.com",
  projectId: "seo-timetable",
  storageBucket: "seo-timetable.firebasestorage.app",
  messagingSenderId: "493605957497",
  appId: "1:493605957497:web:3019ac071f0136e9b349a8"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
await signInAnonymously(auth)

const CHILDREN = [
  { id: 'juwon', name: '서주원', emoji: '🔵' },
  { id: 'yewon', name: '서예원', emoji: '🩷' },
  { id: 'chaewon', name: '서채원', emoji: '🟢' },
]

function todayKey() {
  const now = new Date()
  // KST (UTC+9) 기준으로 날짜 계산
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().split('T')[0]
}

async function getTelegramSettings() {
  const snap = await getDoc(doc(db, 'settings', 'telegram'))
  if (!snap.exists()) {
    throw new Error('Telegram settings not found in Firestore. Configure in Admin page first.')
  }
  return snap.data()
}

async function getHomework(childId, dateKey) {
  const snap = await getDoc(doc(db, 'homework', childId, 'daily', dateKey))
  if (!snap.exists()) return []
  return snap.data().items || []
}

function buildBriefingMessage(childrenResults, dateKey) {
  let msg = `📊 <b>오늘의 달성률 브리핑</b> (${dateKey})\n━━━━━━━━━━━━━━━━\n\n`

  let totalRate = 0
  let count = 0

  for (const child of childrenResults) {
    const { name, emoji, items } = child
    const required = items.filter(i => i.required)
    const optional = items.filter(i => !i.required)
    const completedRequired = required.filter(i => i.completed)
    const completedOptional = optional.filter(i => i.completed)

    if (required.length === 0) {
      msg += `${emoji} <b>${name}</b>: 오늘 숙제 없음\n\n`
      continue
    }

    const rate = Math.round((completedRequired.length / required.length) * 100)
    let indicator = ''
    if (rate === 100) indicator = ' ⭐'
    else if (rate < 50) indicator = ' ⚠️'

    msg += `${emoji} <b>${name}</b>: ${rate}% (${completedRequired.length}/${required.length})${indicator}\n`

    // List completed required items
    if (completedRequired.length > 0) {
      msg += `  ✅ ${completedRequired.map(i => i.label).join(', ')}\n`
    }

    // List incomplete required items
    const incomplete = required.filter(i => !i.completed)
    if (incomplete.length > 0) {
      msg += `  ❌ ${incomplete.map(i => i.label).join(', ')}\n`
    }

    // List completed optional items (bonus)
    if (completedOptional.length > 0) {
      msg += `  🌟 보너스: ${completedOptional.map(i => i.label).join(', ')}\n`
    }

    msg += '\n'
    totalRate += rate
    count++
  }

  msg += `━━━━━━━━━━━━━━━━\n`
  if (count > 0) {
    const avg = Math.round(totalRate / count)
    let avgEmoji = '📈'
    if (avg >= 90) avgEmoji = '🎉'
    else if (avg < 50) avgEmoji = '😟'
    msg += `${avgEmoji} <b>전체 평균: ${avg}%</b>`
  }

  return msg
}

async function sendTelegram(botToken, chatId, message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  })
  const data = await res.json()
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`)
  }
  return data
}

async function main() {
  const dk = todayKey()
  console.log(`[${new Date().toLocaleString('ko-KR')}] Daily briefing for ${dk}`)

  // 1. Get telegram settings (env vars override Firestore for GitHub Actions)
  const envToken = process.env.TELEGRAM_BOT_TOKEN
  const envChatId = process.env.TELEGRAM_CHAT_ID

  let tg
  if (envToken && envChatId) {
    tg = { botToken: envToken, chatId: envChatId, enabled: true }
  } else {
    tg = await getTelegramSettings()
    if (!tg.enabled) {
      console.log('Telegram notifications are disabled. Exiting.')
      process.exit(0)
    }
  }

  // 2. Fetch homework for each child
  const childrenResults = await Promise.all(
    CHILDREN.map(async (child) => {
      const items = await getHomework(child.id, dk)
      return { ...child, items }
    })
  )

  // 3. Build and send message
  const message = buildBriefingMessage(childrenResults, dk)
  console.log('--- Message Preview ---')
  console.log(message.replace(/<[^>]+>/g, ''))
  console.log('--- Sending... ---')

  await sendTelegram(tg.botToken, tg.chatId, message)
  console.log('Sent successfully!')

  process.exit(0)
}

main().catch(err => {
  console.error('Failed:', err.message)
  process.exit(1)
})
