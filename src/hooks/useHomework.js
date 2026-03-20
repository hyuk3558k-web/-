import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { generateHomeworkForDate } from '../utils/homeworkGenerator'

const dateKey = (date) => date.toISOString().split('T')[0]

export function useHomework(childId, date) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const dk = dateKey(date)

  useEffect(() => {
    if (!childId) return
    const docRef = doc(db, 'homework', childId, 'daily', dk)

    // First check if document exists, create if not
    getDoc(docRef).then(snap => {
      if (!snap.exists()) {
        const generated = generateHomeworkForDate(childId, date)
        setDoc(docRef, { items: generated })
      }
    })

    // Real-time listener for live updates
    const unsub = onSnapshot(docRef, snap => {
      if (snap.exists()) {
        setItems(snap.data().items)
      }
      setLoading(false)
    })
    return unsub
  }, [childId, dk])

  const toggleComplete = async (itemId) => {
    const updated = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updated)
    await updateDoc(doc(db, 'homework', childId, 'daily', dk), { items: updated })
  }

  const uploadPhoto = async (itemId, file) => {
    const storageRef = ref(storage, `photos/${childId}/${dk}/${itemId}.jpg`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const updated = items.map(item =>
      item.id === itemId ? { ...item, photoUrl: url } : item
    )
    setItems(updated)
    await updateDoc(doc(db, 'homework', childId, 'daily', dk), { items: updated })
  }

  return { items, loading, toggleComplete, uploadPhoto }
}
