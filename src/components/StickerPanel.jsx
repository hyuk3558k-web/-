import { useState } from 'react'
import { Star, Heart, Crown, X, Trash2 } from 'lucide-react'
import AdminPinModal from './AdminPinModal'

const STICKER_TYPES = [
  { type: 'star', icon: Star, label: '별' },
  { type: 'heart', icon: Heart, label: '하트' },
  { type: 'crown', icon: Crown, label: '왕관' },
]

const STICKER_ICON_MAP = {
  star: Star,
  heart: Heart,
  crown: Crown,
}

export default function StickerPanel({ childName, stickers, onGiveSticker, onRemoveSticker }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [adminVerified, setAdminVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'give' or { type: 'remove', index }

  const handleGive = (type) => {
    if (!from.trim()) return
    onGiveSticker(from.trim(), type)
    setOpen(false)
    setFrom('')
  }

  const handleStickerButtonClick = () => {
    if (adminVerified) {
      setOpen(true)
    } else {
      setPendingAction('give')
      setShowPinModal(true)
    }
  }

  const handleRemoveClick = (index) => {
    if (adminVerified) {
      onRemoveSticker(index)
    } else {
      setPendingAction({ type: 'remove', index })
      setShowPinModal(true)
    }
  }

  const handlePinSuccess = () => {
    setAdminVerified(true)
    setShowPinModal(false)
    if (pendingAction === 'give') {
      setOpen(true)
    } else if (pendingAction && pendingAction.type === 'remove') {
      onRemoveSticker(pendingAction.index)
    }
    setPendingAction(null)
  }

  const handlePinClose = () => {
    setShowPinModal(false)
    setPendingAction(null)
  }

  const recentHistory = (stickers.history || []).slice(-5).reverse()

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span>⭐ {stickers.total}개</span>
        <button onClick={handleStickerButtonClick}
          className="text-xs bg-[#F47458] text-white px-3 py-1 rounded-lg hover:bg-[#e0634a]">
          스티커 주기
        </button>
      </div>

      {/* Sticker history */}
      {recentHistory.length > 0 && (
        <div className="space-y-1.5">
          {recentHistory.map((entry, i) => {
            const realIndex = stickers.history.length - 1 - i
            const IconComp = STICKER_ICON_MAP[entry.type] || Star
            const dateStr = new Date(entry.date).toLocaleDateString('ko-KR', {
              month: 'short', day: 'numeric'
            })
            return (
              <div key={realIndex} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <IconComp size={16} className="text-[#F47458]" />
                  <span className="text-[#3D3229]">{entry.from}</span>
                  <span className="text-gray-400 text-xs">{dateStr}</span>
                </div>
                <button onClick={() => handleRemoveClick(realIndex)}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* PIN modal */}
      {showPinModal && (
        <AdminPinModal onSuccess={handlePinSuccess} onClose={handlePinClose} />
      )}

      {/* Sticker giving modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{childName}에게 스티커 주기</h3>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <input value={from} onChange={e => setFrom(e.target.value)}
              placeholder="보내는 사람 이름" className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" />
            <div className="flex justify-center gap-4">
              {STICKER_TYPES.map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => handleGive(type)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50">
                  <Icon size={28} className="text-[#F47458]" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
