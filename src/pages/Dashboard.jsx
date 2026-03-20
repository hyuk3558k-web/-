import { useState, useEffect, useRef } from 'react'
import { CHILDREN, CHILD_IDS } from '../data/children'
import { useHomework } from '../hooks/useHomework'
import { useStickers } from '../hooks/useStickers'
import { useEvents } from '../hooks/useEvents'
import { calcAchievement } from '../utils/achievement'
import { startAchievementMonitor, stopAchievementMonitor } from '../utils/notifications'
import { useTelegramSettings } from '../hooks/useTelegramSettings'
import { sendTelegramMessage, buildAchievementMessage } from '../utils/telegram'
import ChildCard from '../components/ChildCard'
import Calendar from '../components/Calendar'
import EventModal from '../components/EventModal'
import NotificationToggle from '../components/NotificationToggle'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function formatDateKorean(date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const day = DAY_NAMES[date.getDay()]
  return `${y}년 ${m}월 ${d}일 (${day})`
}

function dateKey(date) {
  return date.toISOString().split('T')[0]
}

function ChildCardWithData({ childId, today }) {
  const child = CHILDREN[childId]
  const { items } = useHomework(childId, today)
  const { stickers } = useStickers(childId)
  const achievement = calcAchievement(items)

  return (
    <ChildCard
      child={child}
      achievement={achievement}
      stickerCount={stickers.total}
    />
  )
}

export default function Dashboard() {
  const today = new Date()
  const todayStr = dateKey(today)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const { events, addEvent, updateEvent, deleteEvent } = useEvents(year, month)

  // Collect today's achievement from all children for the calendar
  // We use a simple wrapper to aggregate data
  const achievementData = {}
  // For MVP, we only show today's combined average achievement
  // This is calculated in the render via AchievementCollector below

  const onChangeMonth = (delta) => {
    setMonth(prev => {
      let newMonth = prev + delta
      let newYear = year
      if (newMonth < 0) {
        newMonth = 11
        newYear = year - 1
      } else if (newMonth > 11) {
        newMonth = 0
        newYear = year + 1
      }
      setYear(newYear)
      return newMonth
    })
  }

  const onSelectDate = (dateStr) => {
    setSelectedDate(dateStr)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8C7B6B] text-sm">{formatDateKorean(today)}</p>
        <NotificationToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {CHILD_IDS.map(id => (
          <ChildCardWithData key={id} childId={id} today={today} />
        ))}
      </div>

      <AchievementCalendar
        year={year}
        month={month}
        today={today}
        todayStr={todayStr}
        events={events}
        onChangeMonth={onChangeMonth}
        onSelectDate={onSelectDate}
      />

      {selectedDate && (
        <EventModal
          date={selectedDate}
          events={events.filter(e => e.date === selectedDate)}
          onAdd={addEvent}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}

// Separate component so we can call hooks for each child to build achievementData
function AchievementCalendar({ year, month, today, todayStr, events, onChangeMonth, onSelectDate }) {
  const juwonHw = useHomework('juwon', today)
  const yewonHw = useHomework('yewon', today)
  const chaewonHw = useHomework('chaewon', today)

  const homeworkRef = useRef({ juwonHw, yewonHw, chaewonHw })
  homeworkRef.current = { juwonHw, yewonHw, chaewonHw }

  const { settings: telegramSettings } = useTelegramSettings()

  useEffect(() => {
    startAchievementMonitor(() => [
      { childName: CHILDREN.juwon.name, items: homeworkRef.current.juwonHw.items },
      { childName: CHILDREN.yewon.name, items: homeworkRef.current.yewonHw.items },
      { childName: CHILDREN.chaewon.name, items: homeworkRef.current.chaewonHw.items },
    ])
    return () => stopAchievementMonitor()
  }, [])

  // Telegram daily summary scheduler
  useEffect(() => {
    if (!telegramSettings.enabled || !telegramSettings.botToken || !telegramSettings.chatId) return

    const colorEmojis = { juwon: '🔵', yewon: '🩷', chaewon: '🟢' }

    function buildChildData(childId, items) {
      const child = CHILDREN[childId]
      const required = items.filter(i => i.required)
      const completed = required.filter(i => i.completed).length
      return {
        name: child.name,
        colorEmoji: colorEmojis[childId],
        achievement: calcAchievement(items),
        completed,
        total: required.length
      }
    }

    const checkAndSend = () => {
      const now = new Date()
      const [targetHour, targetMin] = telegramSettings.sendTime.split(':').map(Number)
      const currentHour = now.getHours()
      const currentMin = now.getMinutes()

      if (currentHour === targetHour && currentMin === targetMin) {
        const todayKey = now.toISOString().split('T')[0]
        const lastSent = localStorage.getItem('telegram_last_sent')
        if (lastSent === todayKey) return

        const childrenData = [
          buildChildData('juwon', homeworkRef.current.juwonHw.items),
          buildChildData('yewon', homeworkRef.current.yewonHw.items),
          buildChildData('chaewon', homeworkRef.current.chaewonHw.items),
        ]

        const message = buildAchievementMessage(childrenData, todayKey)
        sendTelegramMessage(telegramSettings.botToken, telegramSettings.chatId, message)
        localStorage.setItem('telegram_last_sent', todayKey)
      }
    }

    const interval = setInterval(checkAndSend, 60000)
    checkAndSend()
    return () => clearInterval(interval)
  }, [telegramSettings])

  const rates = [
    calcAchievement(juwonHw.items),
    calcAchievement(yewonHw.items),
    calcAchievement(chaewonHw.items),
  ].filter(r => r !== null)

  const achievementData = {}
  if (rates.length > 0) {
    achievementData[todayStr] = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
  }

  return (
    <Calendar
      year={year}
      month={month}
      achievementData={achievementData}
      events={events}
      onSelectDate={onSelectDate}
      onChangeMonth={onChangeMonth}
    />
  )
}
