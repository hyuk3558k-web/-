import { useState } from 'react'
import { Star, Heart, Crown, X } from 'lucide-react'

const STICKER_TYPES = [
  { type: 'star', icon: Star, label: '별' },
  { type: 'heart', icon: Heart, label: '하트' },
  { type: 'crown', icon: Crown, label: '왕관' },
]

export default function StickerPanel({ childName, stickers, onGiveSticker }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')

  const handleGive = (type) => {
    if (!from.trim()) return
    onGiveSticker(from.trim(), type)
    setOpen(false)
    setFrom('')
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span>⭐ {stickers.total}개</span>
        <button onClick={() => setOpen(true)}
          className="text-xs bg-[#F47458] text-white px-3 py-1 rounded-lg hover:bg-[#e0634a]">
          스티커 주기
        </button>
      </div>
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
