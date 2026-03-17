import { useState } from 'react'
import { CHILDREN, CHILD_IDS } from '../data/children'
import { useHomework } from '../hooks/useHomework'
import { useStickers } from '../hooks/useStickers'
import { calcAchievement } from '../utils/achievement'
import ChildCard from '../components/ChildCard'
import Calendar from '../components/Calendar'

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
    console.log('Selected date:', dateStr)
  }

  return (
    <div>
      <p className="text-[#8C7B6B] text-sm mb-6">{formatDateKorean(today)}</p>

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
        onChangeMonth={onChangeMonth}
        onSelectDate={onSelectDate}
      />
    </div>
  )
}

// Separate component so we can call hooks for each child to build achievementData
function AchievementCalendar({ year, month, today, todayStr, onChangeMonth, onSelectDate }) {
  const juwonHw = useHomework('juwon', today)
  const yewonHw = useHomework('yewon', today)
  const chaewonHw = useHomework('chaewon', today)

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
      onSelectDate={onSelectDate}
      onChangeMonth={onChangeMonth}
    />
  )
}
