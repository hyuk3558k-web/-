import { Camera, Check, Clock, Download } from 'lucide-react'

export default function HomeworkChecklist({ items, onToggle, onUploadPhoto, isAdmin, childName, dateStr }) {
  if (!items.length) return <p className="text-[#8C7B6B] text-sm">오늘 숙제 없음</p>

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename.replace(/\.jpg$/, `.${ext}`)
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 200)
    } catch {
      alert('사진 다운로드에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 bg-white shadow-sm ${item.completed ? 'opacity-60' : ''}`}>
          <button onClick={() => onToggle(item.id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-gray-300'}`}>
            {item.completed && <Check size={14} />}
          </button>
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-bold text-[#3D3229] ${item.completed ? 'line-through' : ''}`}>{item.label}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock size={12} className="text-[#8C7B6B]" />
              <span className="text-xs text-[#8C7B6B]">{item.duration}분</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.required ? 'bg-[#F47458] text-white' : 'bg-gray-100 text-[#8C7B6B]'}`}>
                {item.required ? '필수' : '선택'}
              </span>
            </div>
          </div>
          {item.photoUrl && (
            <img src={item.photoUrl} alt="인증" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          {isAdmin && item.photoUrl && (
            <button
              onClick={() => handleDownload(item.photoUrl, `${childName}_${dateStr}_${item.label}.jpg`)}
              className="cursor-pointer text-[#8C7B6B] hover:text-[#22C55E] shrink-0 transition-colors"
              title="사진 다운로드"
            >
              <Download size={18} />
            </button>
          )}
          <label className="cursor-pointer text-[#8C7B6B] hover:text-[#F47458] shrink-0">
            <Camera size={18} />
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files[0] && onUploadPhoto(item.id, e.target.files[0])} />
          </label>
        </div>
      ))}
    </div>
  )
}
