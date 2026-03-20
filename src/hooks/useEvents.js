import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export function useEvents(year, month) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Query events for the given month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

    const q = query(
      collection(db, 'events'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    )

    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setEvents(list)
    })
    return unsub
  }, [year, month])

  const addEvent = async (eventData) => {
    await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: new Date().toISOString()
    })
  }

  const updateEvent = async (eventId, eventData) => {
    await updateDoc(doc(db, 'events', eventId), eventData)
  }

  const deleteEvent = async (eventId) => {
    await deleteDoc(doc(db, 'events', eventId))
  }

  return { events, addEvent, updateEvent, deleteEvent }
}
