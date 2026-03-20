import { useState } from 'react'
import { Plus, Trash2, Edit3, X, Lock, Unlock } from 'lucide-react'
import AdminPinModal from './AdminPinModal'

export default function EventDetail({ date, events, onAdd, onUpdate, onDelete }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [memo, setMemo] = useState('')
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = () => {
    if (!title.trim()) return
    if (editingId) {
      onUpdate(editingId, { title: title.trim(), time: time || null, memo: memo || null, date })
      setEditingId(null)
    } else {
      onAdd({ title: title.trim(), time: time || null, memo: memo || null, date })
    }
    setTitle('')
    setTime('')
    setMemo('')
  }

  const startEdit = (event) => {
    setEditingId(event.id)
    setTitle(event.title)
    setTime(event.time || '')
    setMemo(event.memo || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setTime('')
    setMemo('')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#3D3229]">{date} 일정</h3>
        <button
          onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
          className={`p-1.5 rounded-lg transition-colors ${isAdmin ? 'text-[#22C55E] hover:bg-green-50' : 'text-[#8C7B6B] hover:bg-gray-100'}`}
          title={isAdmin ? '관리자 모드 해제' : '관리자 인증'}
        >
          {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
        </button>
      </div>

      {/* Event list */}
      {events.length > 0 ? (
        <div className="space-y-2 mb-4">
          {events.map(event => (
            <div key={event.id} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#3D3229]">{event.title}</p>
                {event.time && <p className="text-xs text-[#8C7B6B]">{event.time}</p>}
                {event.memo && <p className="text-xs text-[#8C7B6B] mt-0.5">{event.memo}</p>}
              </div>
              {isAdmin && (
                <>
                  <button onClick={() => startEdit(event)} className="text-[#8C7B6B] hover:text-[#F47458] shrink-0">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDelete(event.id)} className="text-[#8C7B6B] hover:text-red-500 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#8C7B6B] mb-4">등록된 일정이 없습니다.</p>
      )}

      {/* Add/Edit form - admin only */}
      {isAdmin && (
        <div className="space-y-2 border-t pt-4">
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="일정 제목 *" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input value={memo} onChange={e => setMemo(e.target.value)}
            placeholder="메모 (선택)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            {editingId && (
              <button onClick={cancelEdit}
                className="flex-1 bg-gray-100 text-[#3D3229] rounded-lg py-2 text-sm font-bold">
                취소
              </button>
            )}
            <button onClick={handleSubmit}
              className="flex-1 bg-[#F47458] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#e0634a] flex items-center justify-center gap-1">
              <Plus size={14} /> {editingId ? '수정' : '일정 추가'}
            </button>
          </div>
        </div>
      )}

      {/* PIN modal */}
      {showPinModal && (
        <AdminPinModal
          onSuccess={() => { setIsAdmin(true); setShowPinModal(false) }}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  )
}
