import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBNfH85KnUnov_8uFVRZxQb4TYDGSnxmMs",
  authDomain: "seo-timetable.firebaseapp.com",
  projectId: "seo-timetable",
  storageBucket: "seo-timetable.firebasestorage.app",
  messagingSenderId: "493605957497",
  appId: "1:493605957497:web:3019ac071f0136e9b349a8"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Anonymous auth for session management
signInAnonymously(auth).catch(console.error)