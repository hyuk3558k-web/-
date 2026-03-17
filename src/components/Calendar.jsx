import { getAchievementColor } from '../utils/achievement'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar({ year, month, achievementData, onSelectDate, onChangeMonth }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onChangeMonth(-1)}><ChevronLeft size={20} /></button>
        <h3 className="font-bold text-[#3D3229]">{year}년 {monthNames[month]}</h3>
        <button onClick={() => onChangeMonth(1)}><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#8C7B6B] mb-2">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const rate = achievementData[dateStr] ?? null
          const color = getAchievementColor(rate)
          return (
            <button key={i} onClick={() => onSelectDate(dateStr)}
              className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-gray-50 text-sm">
              <span>{day}</span>
              {rate !== null && (
                <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: color }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
