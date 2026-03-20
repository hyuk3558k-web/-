import { useState } from 'react'
import AdminPinModal from '../components/AdminPinModal'
import { CHILDREN, CHILD_IDS } from '../data/children'
import { SCHEDULES } from '../data/schedules'
import { HOMEWORK_TEMPLATES } from '../data/homeworkTemplates'
import { seedFirestore } from '../utils/seedFirestore'
import { useTelegramSettings } from '../hooks/useTelegramSettings'
import { useHomework } from '../hooks/useHomework'
import { calcAchievement } from '../utils/achievement'
import { sendTelegramMessage, buildAchievementMessage } from '../utils/telegram'

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
  const [tgSaving, setTgSaving] = useState(false)
  const [tgSendResult, setTgSendResult] = useState(null)

  const { settings: tgSettings, loading: tgLoading, saveSettings: saveTgSettings } = useTelegramSettings()
  const [tgForm, setTgForm] = useState(null)

  // Homework hooks for test send
  const todayDate = new Date()
  const juwonHw = useHomework('juwon', todayDate)
  const yewonHw = useHomework('yewon', todayDate)
  const chaewonHw = useHomework('chaewon', todayDate)

  const currentTgForm = tgForm || tgSettings

  if (!authenticated) {
    return <AdminPinModal onSuccess={() => setAuthenticated(true)} onClose={() => window.history.back()} />
  }

  const child = CHILDREN[selectedChild]
  const schedule = SCHEDULES[selectedChild]?.[selectedDay] || []
  const hwTemplate = HOMEWORK_TEMPLATES[selectedChild]

  const handleTgChange = (field, value) => {
    setTgForm(prev => ({ ...(prev || tgSettings), [field]: value }))
  }

  const handleTgSave = async () => {
    setTgSaving(true)
    await saveTgSettings(currentTgForm)
    setTgSaving(false)
  }

  const handleTestSend = async () => {
    const colorEmojis = { juwon: '🔵', yewon: '🩷', chaewon: '🟢' }
    const buildChildData = (childId, items) => {
      const c = CHILDREN[childId]
      const required = items.filter(i => i.required)
      const completed = required.filter(i => i.completed).length
      return {
        name: c.name,
        colorEmoji: colorEmojis[childId],
        achievement: calcAchievement(items),
        completed,
        total: required.length
      }
    }

    const childrenData = [
      buildChildData('juwon', juwonHw.items),
      buildChildData('yewon', yewonHw.items),
      buildChildData('chaewon', chaewonHw.items),
    ]

    const todayKey = todayDate.toISOString().split('T')[0]
    const message = buildAchievementMessage(childrenData, todayKey)

    try {
      const result = await sendTelegramMessage(currentTgForm.botToken, currentTgForm.chatId, message)
      if (result.ok) {
        setTgSendResult('success')
      } else {
        setTgSendResult('fail')
        alert(`전송 실패: ${result.description || '알 수 없는 오류'}`)
      }
    } catch (err) {
      setTgSendResult('fail')
      alert(`전송 오류: ${err.message}`)
    }
    setTimeout(() => setTgSendResult(null), 3000)
  }

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

      {/* Telegram settings section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-6">
        <h3 className="font-bold text-[#3D3229] mb-4">📨 텔레그램 알림 설정</h3>
        {tgLoading ? (
          <p className="text-sm text-[#8C7B6B]">설정 불러오는 중...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#8C7B6B] mb-1">Bot Token</label>
              <input
                type="text"
                value={currentTgForm.botToken}
                onChange={e => handleTgChange('botToken', e.target.value)}
                placeholder="123456:ABC-DEF..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47458]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#8C7B6B] mb-1">Chat ID</label>
              <input
                type="text"
                value={currentTgForm.chatId}
                onChange={e => handleTgChange('chatId', e.target.value)}
                placeholder="-1001234567890"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47458]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#8C7B6B] mb-1">발송 시간</label>
              <input
                type="time"
                value={currentTgForm.sendTime}
                onChange={e => handleTgChange('sendTime', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47458]"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-[#8C7B6B]">알림 활성화</label>
              <button
                onClick={() => handleTgChange('enabled', !currentTgForm.enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${currentTgForm.enabled ? 'bg-[#22C55E]' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${currentTgForm.enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTgSave}
                disabled={tgSaving}
                className="bg-[#3D3229] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#5a4a3a] disabled:opacity-50 text-sm">
                {tgSaving ? '저장 중...' : '설정 저장'}
              </button>
              <button
                onClick={handleTestSend}
                disabled={!currentTgForm.botToken || !currentTgForm.chatId}
                className="bg-[#4A90D9] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#3a7bc8] disabled:opacity-50 text-sm">
                {tgSendResult === 'success' ? '✅ 전송 완료' : '테스트 전송'}
              </button>
            </div>
            <p className="text-xs text-[#8C7B6B]">매일 설정된 시간에 오늘의 달성률 요약이 텔레그램으로 발송됩니다.</p>
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
