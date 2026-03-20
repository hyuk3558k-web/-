import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function useTelegramSettings() {
  const [settings, setSettings] = useState({
    botToken: '',
    chatId: '',
    sendTime: '19:00',
    enabled: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'telegram'), snap => {
      if (snap.exists()) {
        setSettings(snap.data())
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const saveSettings = async (newSettings) => {
    await setDoc(doc(db, 'settings', 'telegram'), newSettings)
  }

  return { settings, loading, saveSettings }
}
