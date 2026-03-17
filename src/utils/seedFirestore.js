import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CHILDREN, CHILD_IDS } from '../data/children'

export async function seedFirestore() {
  try {
    // Seed children documents
    for (const id of CHILD_IDS) {
      await setDoc(doc(db, 'children', id), CHILDREN[id])
    }

    // Seed stickers documents
    for (const id of CHILD_IDS) {
      await setDoc(doc(db, 'stickers', id), { total: 0, history: [] })
    }

    // Seed settings
    await setDoc(doc(db, 'settings', 'config'), {
      adminPin: '1234',
      dinnerTime: '19:30'
    })

    console.log('Firestore seeded successfully!')
    return true
  } catch (error) {
    console.error('Error seeding Firestore:', error)
    return false
  }
}
