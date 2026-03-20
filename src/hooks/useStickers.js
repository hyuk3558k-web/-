import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { db } from '../firebase'

export function useStickers(childId) {
  const [stickers, setStickers] = useState({ total: 0, history: [] })

  useEffect(() => {
    if (!childId) return
    const unsub = onSnapshot(doc(db, 'stickers', childId), snap => {
      if (snap.exists()) setStickers(snap.data())
    })
    return unsub
  }, [childId])

  const giveSticker = async (fromName, stickerType) => {
    const docRef = doc(db, 'stickers', childId)
    await setDoc(docRef, {
      total: increment(1),
      history: arrayUnion({
        from: fromName,
        type: stickerType,
        date: new Date().toISOString()
      })
    }, { merge: true })
  }

  const removeSticker = async (stickerIndex) => {
    const docRef = doc(db, 'stickers', childId)
    const newHistory = [...stickers.history]
    newHistory.splice(stickerIndex, 1)
    await updateDoc(docRef, {
      total: increment(-1),
      history: newHistory
    })
  }

  return { stickers, giveSticker, removeSticker }
}
