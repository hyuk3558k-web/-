import { useState } from 'react'
import { Camera, Check, Clock, X, Loader } from 'lucide-react'

export default function HomeworkChecklist({ items, onToggle, onUploadPhoto, isAdmin, childName, dateStr }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewLabel, setPreviewLabel] = useState('')
  const [uploadingId, setUploadingId] = useState(null)

  if (!items.length) return <p className="text-[#8C7B6B] text-sm">등록된 숙제가 없습니다.</p>

  const handleUpload = async (itemId, file) => {
    setUploadingId(itemId)
    try {
      await onUploadPhoto(itemId, file)
    } catch {
      alert('사진 업로드에 실패했습니다. 다시 시도해주세요.')
    }
    setUploadingId(null)
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="rounded-xl bg-white shadow-sm">
          <div className={`flex items-center gap-3 px-4 py-3 ${item.completed ? 'opacity-60' : ''}`}>
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
                {item.photoUrl && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#22C55E] font-bold">
                    인증완료
                  </span>
                )}
              </div>
            </div>
            {/* Uploading state */}
            {uploadingId === item.id ? (
              <div className="flex items-center gap-1 bg-[#FFF8E1] text-[#F59E0B] px-3 py-2 rounded-lg text-xs font-bold shrink-0">
                <Loader size={14} className="animate-spin" />
                업로드중...
              </div>
            ) : item.photoUrl ? (
              /* Photo thumbnail - click to preview */
              <button
                onClick={() => { setPreviewUrl(item.photoUrl); setPreviewLabel(item.label) }}
                className="relative shrink-0 group"
                title="클릭하면 크게 보기"
              >
                <img src={item.photoUrl} alt="인증" className="w-12 h-12 rounded-lg object-cover border-2 border-[#22C55E]" />
                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">보기</span>
                </div>
              </button>
            ) : (
              /* Upload button */
              <label className="cursor-pointer flex items-center gap-1 bg-gray-100 text-[#8C7B6B] hover:bg-[#FFF0ED] hover:text-[#F47458] px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0">
                <Camera size={14} />
                사진
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files[0] && handleUpload(item.id, e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
      ))}

      {/* Photo preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-bold text-[#3D3229] text-sm">{previewLabel} - 인증 사진</h3>
              <button onClick={() => setPreviewUrl(null)} className="text-[#8C7B6B] hover:text-[#3D3229]">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <img src={previewUrl} alt="인증 사진" className="w-full rounded-xl object-contain max-h-[60vh]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
