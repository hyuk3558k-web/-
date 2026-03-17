import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { requestNotificationPermission, isNotificationEnabled } from '../utils/notifications'

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false)
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) {
      setUnsupported(true)
      return
    }
    setEnabled(Notification.permission === 'granted')
  }, [])

  const handleToggle = async () => {
    if (enabled) {
      // Can't revoke programmatically, inform user
      alert('알림을 끄려면 브라우저 설정에서 이 사이트의 알림을 차단해주세요.')
      return
    }
    const granted = await requestNotificationPermission()
    setEnabled(granted)
    if (granted) {
      new Notification('서씨네 시간표', {
        body: '알림이 활성화되었습니다! 저녁 7시 이후 숙제 미완료 시 알림을 보내드릴게요.',
        tag: 'notification-enabled'
      })
    }
  }

  if (unsupported) return null

  return (
    <button onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
        enabled
          ? 'bg-[#22C55E] text-white'
          : 'bg-gray-100 text-[#8C7B6B] hover:bg-gray-200'
      }`}>
      {enabled ? <Bell size={16} /> : <BellOff size={16} />}
      {enabled ? '알림 켜짐' : '알림 받기'}
    </button>
  )
}
