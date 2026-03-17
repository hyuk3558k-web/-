import { useState } from 'react'
import AdminPinModal from '../components/AdminPinModal'
import { CHILDREN, CHILD_IDS } from '../data/children'
import { SCHEDULES } from '../data/schedules'
import { HOMEWORK_TEMPLATES } from '../data/homeworkTemplates'
import { seedFirestore } from '../utils/seedFirestore'

const DAY_LABELS = [
  { key: 'mon', label: '월요일' },
  { key: 'tue', label: '화요일' },
  { key: 'wed', label: '수요일' },
  { key: 'thu', label: '목요일' },
  { key: 'fri', label: '금요일' },
  { key: 'sat', label: '토요일' },
]

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [selectedChild, setSelectedChild] = useState('juwon')
  const [selectedDay, setSelectedDay] = useState('mon')
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  if (!authenticated) {
    return <AdminPinModal onSuccess={() => setAuthenticated(true)} onClose={() => window.history.back()} />
  }

  const child = CHILDREN[selectedChild]
  const schedule = SCHEDULES[selectedChild]?.[selectedDay] || []
  const hwTemplate = HOMEWORK_TEMPLATES[selectedChild]

  const handleSeed = async () => {
    setSeeding(true)
    await seedFirestore()
    setSeeding(false)
    setSeedDone(true)
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-[#3D3229] mb-6">⚙️ 관리자 모드</h2>

      {/* Child selector */}
      <div className="flex gap-2 mb-6">
        {CHILD_IDS.map(id => (
          <button key={id} onClick={() => setSelectedChild(id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              selectedChild === id ? 'text-white' : ''
            }`}
            style={{ backgroundColor: selectedChild === id ? CHILDREN[id].color : CHILDREN[id].lightColor }}>
            {CHILDREN[id].emoji} {CHILDREN[id].name}
          </button>
        ))}
      </div>

      {/* Schedule viewer section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6">
        <h3 className="font-bold text-[#3D3229] mb-4">📅 시간표 확인</h3>
        <div className="flex gap-1 mb-4 flex-wrap">
          {DAY_LABELS.map(({ key, label }) => (
            <button key={key} onClick={() => setSelectedDay(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                selectedDay === key ? 'bg-[#3D3229] text-white' : 'bg-gray-100'
              }`}>{label}</button>
          ))}
        </div>
        {schedule.length === 0 ? (
          <p className="text-[#8C7B6B] text-sm">이 요일에는 일정이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {schedule.map((block, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <span className="text-xs text-[#8C7B6B] min-w-[5rem]">{block.start} - {block.end}</span>
                <span className="text-sm font-bold">{block.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-[#8C7B6B]">{block.type}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[#8C7B6B] mt-4">※ 시간표 수정은 코드에서 직접 변경하거나 추후 Firestore 연동 예정</p>
      </section>

      {/* Homework template viewer section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6">
        <h3 className="font-bold text-[#3D3229] mb-4">📝 숙제 템플릿</h3>
        {hwTemplate?.daily?.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-bold text-[#8C7B6B] mb-2">매일 숙제</h4>
            {hwTemplate.daily.map((hw, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-1">
                <span className="text-sm">{hw.label}</span>
                <span className="text-xs text-[#8C7B6B]">{hw.duration}분</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F47458] text-white">필수</span>
              </div>
            ))}
          </div>
        )}
        {hwTemplate?.beforeAcademy && (
          <div className="mb-3">
            <h4 className="text-sm font-bold text-[#8C7B6B] mb-2">학원 전날 숙제</h4>
            {Object.entries(hwTemplate.beforeAcademy).map(([academy, items]) => (
              <div key={academy}>
                <p className="text-xs text-[#8C7B6B] mb-1">{academy}:</p>
                {items.map((hw, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-1 ml-4">
                    <span className="text-sm">{hw.label}</span>
                    <span className="text-xs text-[#8C7B6B]">{hw.duration}분</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F47458] text-white">필수</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {hwTemplate?.optional?.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[#8C7B6B] mb-2">선택 숙제</h4>
            {hwTemplate.optional.map((hw, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-1">
                <span className="text-sm">{hw.label}</span>
                <span className="text-xs text-[#8C7B6B]">{hw.duration}분</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-[#8C7B6B]">선택</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seed / Reset section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <h3 className="font-bold text-[#3D3229] mb-4">🔧 데이터 관리</h3>
        <button onClick={handleSeed} disabled={seeding}
          className="bg-[#F47458] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e0634a] disabled:opacity-50">
          {seeding ? '설정 중...' : seedDone ? '✅ 초기 데이터 설정 완료' : '초기 데이터 설정'}
        </button>
        <p className="text-xs text-[#8C7B6B] mt-2">Firestore에 어린이 정보, 스티커, 설정 데이터를 초기화합니다.</p>
      </section>
    </div>
  )
}
