import { useState } from 'react'
import { X, Plus, Trash2, Edit3 } from 'lucide-react'

export default function EventModal({ date, events, onAdd, onUpdate, onDelete, onClose }) {
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#3D3229]">{date} 일정</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Existing events */}
        {events.length > 0 && (
          <div className="mb-4 space-y-2">
            {events.map(event => (
              <div key={event.id} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#3D3229]">{event.title}</p>
                  {event.time && <p className="text-xs text-[#8C7B6B]">{event.time}</p>}
                  {event.memo && <p className="text-xs text-[#8C7B6B] mt-0.5">{event.memo}</p>}
                </div>
                <button onClick={() => startEdit(event)} className="text-[#8C7B6B] hover:text-[#F47458] shrink-0">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => onDelete(event.id)} className="text-[#8C7B6B] hover:text-red-500 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit form */}
        <div className="space-y-2">
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
      </div>
    </div>
  )
}
