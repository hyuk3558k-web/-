import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CHILDREN } from '../data/children'
import { useHomework } from '../hooks/useHomework'
import { useSchedule } from '../hooks/useSchedule'
import { useStickers } from '../hooks/useStickers'
import ScheduleTimeline from '../components/ScheduleTimeline'
import HomeworkChecklist from '../components/HomeworkChecklist'
import StickerPanel from '../components/StickerPanel'
import NotificationToggle from '../components/NotificationToggle'
import AdminPinModal from '../components/AdminPinModal'
import { Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_LABELS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
]

export default function Schedule() {
  const { name } = useParams()
  const child = CHILDREN[name]

  const today = new Date()
  const todayDayIndex = today.getDay() // 0=sun
  const [selectedDay, setSelectedDay] = useState(
    todayDayIndex === 0 ? 'mon' : DAY_LABELS[todayDayIndex - 1]?.key || 'mon'
  )

  // Date navigation for homework history (up to 7 days back)
  const [homeworkDate, setHomeworkDate] = useState(today)
  const homeworkDateStr = homeworkDate.toISOString().split('T')[0]
  const isToday = homeworkDateStr === today.toISOString().split('T')[0]

  const changeHomeworkDate = (delta) => {
    const newDate = new Date(homeworkDate)
    newDate.setDate(newDate.getDate() + delta)
    // Don't go beyond today or more than 7 days back
    const diffDays = Math.floor((today - newDate) / (1000 * 60 * 60 * 24))
    if (diffDays < 0 || diffDays > 7) return
    setHomeworkDate(newDate)
  }

  const formatDateKorean = (date) => {
    const m = date.getMonth() + 1
    const d = date.getDate()
    const dayNames = ['일','월','화','수','목','금','토']
    return `${m}/${d} (${dayNames[date.getDay()]})`
  }

  // Build a date for the selected day of the current week
  const selectedDate = new Date(today)
  const diff = DAY_LABELS.findIndex(d => d.key === selectedDay) + 1 - today.getDay()
  selectedDate.setDate(today.getDate() + diff)

  const { blocks } = useSchedule(name, selectedDate)
  const { items, toggleComplete, uploadPhoto } = useHomework(name, homeworkDate)
  const { stickers, giveSticker, removeSticker } = useStickers(name)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-2xl mb-2">😢</p>
          <p className="text-[#3D3229] font-bold">아이를 찾을 수 없습니다</p>
          <Link to="/" className="text-sm text-[#8B7355] underline mt-2 inline-block">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Child tabs */}
      <div className="flex gap-2 mb-4">
        {Object.values(CHILDREN).map(c => (
          <Link
            key={c.id}
            to={`/schedule/${c.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              c.id === name ? 'text-white' : 'text-[#3D3229]'
            }`}
            style={{ backgroundColor: c.id === name ? c.color : c.lightColor }}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {/* Day-of-week tabs */}
      <div className="flex gap-1 mb-6">
        {DAY_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDay(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              selectedDay === key
                ? 'bg-[#3D3229] text-white'
                : 'bg-white text-[#3D3229]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h3 className="font-bold text-[#3D3229] mb-4">📅 시간표</h3>
          <ScheduleTimeline blocks={blocks} childColor={child.color} />
        </div>
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#3D3229]">✏️ 숙제</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeHomeworkDate(-1)} className="p-1 rounded hover:bg-gray-100">
                    <ChevronLeft size={16} className="text-[#8C7B6B]" />
                  </button>
                  <span className={`text-sm font-bold ${isToday ? 'text-[#F47458]' : 'text-[#8C7B6B]'}`}>
                    {isToday ? '오늘' : formatDateKorean(homeworkDate)}
                  </span>
                  <button onClick={() => changeHomeworkDate(1)} className="p-1 rounded hover:bg-gray-100" disabled={isToday}>
                    <ChevronRight size={16} className={isToday ? 'text-gray-300' : 'text-[#8C7B6B]'} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
                className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-[#22C55E] hover:bg-green-50' : 'text-[#8C7B6B] hover:bg-gray-100'}`}
                title={isAdmin ? '관리자 모드 해제' : '관리자 인증'}
              >
                {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
            </div>
            <HomeworkChecklist
              items={items}
              onToggle={toggleComplete}
              onUploadPhoto={uploadPhoto}
              isAdmin={isAdmin}
              childName={child.name}
              dateStr={homeworkDateStr}
            />
            {showPinModal && (
              <AdminPinModal
                onSuccess={() => { setIsAdmin(true); setShowPinModal(false) }}
                onClose={() => setShowPinModal(false)}
              />
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3D3229]">🌟 칭찬 스티커</h3>
              <NotificationToggle />
            </div>
            <StickerPanel
              childName={child.name}
              stickers={stickers}
              onGiveSticker={giveSticker}
              onRemoveSticker={removeSticker}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
