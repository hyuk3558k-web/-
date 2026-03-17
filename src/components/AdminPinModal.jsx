import { useState } from 'react'
import { X } from 'lucide-react'

export default function AdminPinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const ADMIN_PIN = '1234'

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-72 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#3D3229]">관리자 인증</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <input type="password" maxLength={4} value={pin}
          onChange={e => { setPin(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="4자리 PIN"
          className="w-full text-center text-2xl tracking-widest border rounded-lg px-3 py-3 mb-2" />
        {error && <p className="text-red-500 text-xs text-center mb-2">PIN이 틀렸습니다</p>}
        <button onClick={handleSubmit}
          className="w-full bg-[#F47458] text-white rounded-lg py-2 font-bold">확인</button>
      </div>
    </div>
  )
}
