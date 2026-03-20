# 서씨네 시간표 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 어린이 3명의 일과/숙제를 관리하고 달성률을 추적하는 가족용 웹앱 구축

**Architecture:** React SPA with React Router for page navigation. Firebase Firestore for real-time data sync, Firebase Storage for photo uploads. All schedule/homework data lives in Firestore; the app reads weekly templates and generates daily homework on first access. No server-side logic needed except optional FCM Cloud Function for push notifications.

**Tech Stack:** React 18, Vite, Tailwind CSS 4 (via @tailwindcss/vite), React Router 6, Firebase (Firestore, Auth, Storage, Hosting), Lucide React icons

**Spec:** `docs/superpowers/specs/2026-03-17-family-schedule-design.md`

---

## File Structure

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Router setup
├── firebase.js                 # Firebase config & initialization
├── data/
│   ├── children.js             # Children metadata (names, colors, grades)
│   ├── schedules.js            # Weekly schedule templates per child
│   └── homeworkTemplates.js    # Homework templates with required/optional flags
├── hooks/
│   ├── useHomework.js          # Hook: read/write daily homework from Firestore
│   ├── useStickers.js          # Hook: read/give stickers
│   └── useSchedule.js          # Hook: read/write schedule blocks
├── utils/
│   ├── achievement.js          # Calculate achievement rate from homework items
│   └── homeworkGenerator.js    # Generate daily homework from templates + schedule
├── components/
│   ├── Layout.jsx              # Shared layout: header + nav + content area
│   ├── ProgressBar.jsx         # Horizontal bar progress component
│   ├── ChildCard.jsx           # Dashboard card per child (name, progress bar, stickers)
│   ├── Calendar.jsx            # Monthly calendar with achievement colors
│   ├── ScheduleTimeline.jsx    # Vertical timeline for one day's schedule blocks
│   ├── HomeworkChecklist.jsx   # Homework items with checkboxes + photo upload
│   ├── StickerPanel.jsx        # Sticker display + give sticker modal
│   └── AdminPinModal.jsx       # PIN input modal for admin access
├── pages/
│   ├── Dashboard.jsx           # Main dashboard: cards + calendar
│   ├── Schedule.jsx            # Individual schedule page with tabs
│   └── Admin.jsx               # Admin page: edit schedules, homework, stickers
├── index.css                   # Tailwind directives + global styles + font import
public/
├── index.html
firebase.json                   # Firebase hosting config
firestore.rules                 # Security rules
.firebaserc                     # Firebase project alias
package.json
vite.config.js
tailwind.config.js
postcss.config.js
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

- [ ] **Step 1: Initialize Vite React project**

```bash
cd "C:\Users\user\Desktop\엔지니어2기 혜영\서씨네 시간효율화 프로젝트"
npm create vite@latest . -- --template react
```

Select: React, JavaScript

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom firebase lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind**

`src/index.css`:
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=NanumSquareRound:wght@400;700;800&display=swap');
```

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 4: Set up App.jsx with React Router**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule/:name" element={<Schedule />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Create placeholder pages and Layout**

Create minimal `Dashboard.jsx`, `Schedule.jsx`, `Admin.jsx` returning `<div>Page Name</div>`.

`Layout.jsx`:
```jsx
import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] font-['NanumSquareRound']">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-[#3D3229]">서씨네 시간표</Link>
        <nav className="flex gap-2">
          <Link to="/schedule/juwon" className="px-3 py-1 rounded-lg text-sm bg-[#E8F1FA] text-[#6B9FD6]">주원</Link>
          <Link to="/schedule/yewon" className="px-3 py-1 rounded-lg text-sm bg-[#FDE8ED] text-[#E8859A]">예원</Link>
          <Link to="/schedule/chaewon" className="px-3 py-1 rounded-lg text-sm bg-[#E5F5F2] text-[#6BC5B8]">채원</Link>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Expected: App loads at localhost:5173, navigation links work, page placeholders render.

- [ ] **Step 7: Verify .gitignore**

Vite creates `.gitignore` automatically. Verify it includes `node_modules`, `dist`, `.env*`. If not, add them.

- [ ] **Step 8: Commit**

```bash
git init
git add package.json vite.config.js src/ index.html .gitignore
git commit -m "chore: scaffold Vite + React + Tailwind + Router project"
```

---

### Task 2: Firebase Configuration & Data Layer

**Files:**
- Create: `src/firebase.js`, `src/data/children.js`, `src/data/schedules.js`, `src/data/homeworkTemplates.js`, `firebase.json`, `.firebaserc`, `firestore.rules`

- [ ] **Step 1: Create Firebase project config**

`src/firebase.js`:
```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  // TODO: Replace with actual Firebase project config
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Anonymous auth for session management
signInAnonymously(auth).catch(console.error)
```

- [ ] **Step 2: Create children data**

`src/data/children.js`:
```js
export const CHILDREN = {
  juwon: {
    id: 'juwon',
    name: '서주원',
    grade: '중1',
    color: '#6B9FD6',
    lightColor: '#E8F1FA',
    emoji: '🧑‍💻'
  },
  yewon: {
    id: 'yewon',
    name: '서예원',
    grade: '초3',
    color: '#E8859A',
    lightColor: '#FDE8ED',
    emoji: '🎀'
  },
  chaewon: {
    id: 'chaewon',
    name: '서채원',
    grade: '초2',
    color: '#6BC5B8',
    lightColor: '#E5F5F2',
    emoji: '🌿'
  }
}

export const CHILD_IDS = Object.keys(CHILDREN)
```

- [ ] **Step 3: Create weekly schedule templates**

`src/data/schedules.js` — contains `SCHEDULES` object mapping `childId → dayOfWeek → blocks[]`. Each block has `{ start, end, type, label }`. All schedule data from the spec's initial data tables goes here. Days: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`.

Complete data:
```js
export const SCHEDULES = {
  juwon: {
    mon: [
      { start: '09:00', end: '15:30', type: 'school', label: '학교' },
      { start: '19:30', end: '20:00', type: 'dinner', label: '저녁식사' },
    ],
    tue: [
      { start: '09:00', end: '15:30', type: 'school', label: '학교' },
      { start: '15:30', end: '19:00', type: 'academy', label: '수학학원' },
      { start: '19:30', end: '20:00', type: 'dinner', label: '저녁식사' },
    ],
    wed: [
      { start: '09:00', end: '15:30', type: 'school', label: '학교' },
      { start: '15:30', end: '19:00', type: 'academy', label: '수학학원' },
      { start: '19:30', end: '20:00', type: 'dinner', label: '저녁식사' },
    ],
    thu: [
      { start: '09:00', end: '15:30', type: 'school', label: '학교' },
      { start: '15:30', end: '19:00', type: 'academy', label: '수학학원' },
      { start: '19:30', end: '20:00', type: 'dinner', label: '저녁식사' },
    ],
    fri: [
      { start: '09:00', end: '15:30', type: 'school', label: '학교' },
      { start: '19:30', end: '20:00', type: 'dinner', label: '저녁식사' },
    ],
  },
  yewon: {
    mon: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '17:00', end: '17:50', type: 'lesson', label: '피아노' },
      { start: '19:00', end: '20:00', type: 'lesson', label: '책수업' },
    ],
    tue: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '15:30', end: '17:30', type: 'academy', label: '수학학원' },
    ],
    wed: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '16:20', end: '17:30', type: 'academy', label: '수학학원' },
    ],
    thu: [
      { start: '09:00', end: '14:30', type: 'school', label: '학교' },
      { start: '15:30', end: '17:30', type: 'academy', label: '수학학원' },
    ],
    fri: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '17:00', end: '17:50', type: 'lesson', label: '피아노' },
    ],
    sat: [
      { start: '11:30', end: '13:00', type: 'academy', label: '수학학원' },
    ],
  },
  chaewon: {
    mon: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '17:00', end: '17:50', type: 'lesson', label: '피아노' },
      { start: '19:00', end: '20:00', type: 'lesson', label: '책수업' },
    ],
    tue: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
    ],
    wed: [
      { start: '09:00', end: '12:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '16:00', end: '17:30', type: 'academy', label: '수학학원' },
    ],
    thu: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '15:30', end: '17:30', type: 'academy', label: '수학학원' },
    ],
    fri: [
      { start: '09:00', end: '13:50', type: 'school', label: '학교' },
      { start: '14:00', end: '16:00', type: 'academy', label: '영어학원' },
      { start: '17:00', end: '17:50', type: 'lesson', label: '피아노' },
    ],
    sat: [
      { start: '11:30', end: '13:00', type: 'academy', label: '수학학원' },
    ],
  }
}
```

- [ ] **Step 4: Create homework templates**

`src/data/homeworkTemplates.js`:
```js
// required: true = 필수 (학원 전날), false = 선택 (시간 남을 때)
export const HOMEWORK_TEMPLATES = {
  juwon: {
    daily: [
      { label: '엠베스트', duration: 60, required: true }
    ],
    beforeAcademy: {
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    }
  },
  yewon: {
    daily: [],
    beforeAcademy: {
      '영어학원': [
        { label: '영어 단어+워크북', duration: 30, required: true }
      ],
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    },
    optional: [
      { label: '러닝포털', duration: 30, required: false },
      { label: '국어+한자', duration: 30, required: false }
    ]
  },
  chaewon: {
    daily: [],
    beforeAcademy: {
      '영어학원': [
        { label: '영어 단어+워크북', duration: 30, required: true }
      ],
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    },
    optional: [
      { label: '러닝포털', duration: 30, required: false },
      { label: '국어+한자', duration: 30, required: false }
    ]
  }
}
```

- [ ] **Step 5: Create Firebase config files**

`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

`firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/firebase.js src/data/ firebase.json firestore.rules
git commit -m "feat: add Firebase config and schedule/homework data templates"
```

---

### Task 3: Utility Functions

**Files:**
- Create: `src/utils/achievement.js`, `src/utils/homeworkGenerator.js`

- [ ] **Step 1: Write achievement calculator**

`src/utils/achievement.js`:
```js
export function calcAchievement(homeworkItems) {
  if (!homeworkItems || homeworkItems.length === 0) return null
  const requiredItems = homeworkItems.filter(item => item.required)
  if (requiredItems.length === 0) return null
  const completed = requiredItems.filter(item => item.completed).length
  return Math.round((completed / requiredItems.length) * 100)
}

export function calcBonusCount(homeworkItems) {
  if (!homeworkItems) return 0
  return homeworkItems.filter(item => !item.required && item.completed).length
}

export function getAchievementColor(rate) {
  if (rate === null) return 'transparent'
  if (rate >= 90) return '#22C55E'  // green
  if (rate >= 50) return '#EAB308'  // yellow
  return '#EF4444'                   // red
}
```

- [ ] **Step 2: Write homework generator**

`src/utils/homeworkGenerator.js`:
```js
import { HOMEWORK_TEMPLATES } from '../data/homeworkTemplates'
import { SCHEDULES } from '../data/schedules'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function generateHomeworkForDate(childId, date) {
  const dayIndex = date.getDay()
  const dayKey = DAY_KEYS[dayIndex]
  if (dayKey === 'sun') return []

  const template = HOMEWORK_TEMPLATES[childId]
  if (!template) return []

  const items = []
  let idCounter = 1

  // 1. Daily required homework
  if (template.daily) {
    template.daily.forEach(hw => {
      items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
    })
  }

  // 2. Before-academy homework: check if TOMORROW has that academy
  const tomorrowDate = new Date(date)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowDayKey = DAY_KEYS[tomorrowDate.getDay()]
  const tomorrowSchedule = SCHEDULES[childId]?.[tomorrowDayKey] || []

  if (template.beforeAcademy) {
    Object.entries(template.beforeAcademy).forEach(([academyLabel, hwList]) => {
      const hasTomorrow = tomorrowSchedule.some(
        block => block.type === 'academy' && block.label.includes(academyLabel.replace('학원', ''))
      )
      if (hasTomorrow) {
        hwList.forEach(hw => {
          items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
        })
      }
    })
  }

  // 3. Optional homework (if time allows — always include, mark as optional)
  if (template.optional) {
    template.optional.forEach(hw => {
      items.push({ ...hw, id: `hw-${idCounter++}`, completed: false, photoUrl: null })
    })
  }

  return items
}
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/
git commit -m "feat: add achievement calculator and homework generator utilities"
```

---

### Task 4: Firebase Hooks

**Files:**
- Create: `src/hooks/useHomework.js`, `src/hooks/useStickers.js`, `src/hooks/useSchedule.js`

- [ ] **Step 1: Create useHomework hook**

`src/hooks/useHomework.js`:
```js
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
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

    getDoc(docRef).then(snap => {
      if (snap.exists()) {
        setItems(snap.data().items)
      } else {
        const generated = generateHomeworkForDate(childId, date)
        setDoc(docRef, { items: generated })
        setItems(generated)
      }
      setLoading(false)
    })
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
```

- [ ] **Step 2: Create useStickers hook**

`src/hooks/useStickers.js`:
```js
import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, arrayUnion, increment } from 'firebase/firestore'
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

  return { stickers, giveSticker }
}
```

- [ ] **Step 3: Create useSchedule hook**

`src/hooks/useSchedule.js`:
```js
import { SCHEDULES } from '../data/schedules'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function useSchedule(childId, date) {
  const dayKey = DAY_KEYS[date.getDay()]
  const blocks = SCHEDULES[childId]?.[dayKey] || []
  return { blocks, dayKey }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add Firebase hooks for homework, stickers, and schedule"
```

---

### Task 5: Shared UI Components

**Files:**
- Create: `src/components/ProgressBar.jsx`, `src/components/ChildCard.jsx`, `src/components/ScheduleTimeline.jsx`, `src/components/HomeworkChecklist.jsx`, `src/components/StickerPanel.jsx`, `src/components/Calendar.jsx`, `src/components/AdminPinModal.jsx`

- [ ] **Step 1: Create ProgressBar component**

`src/components/ProgressBar.jsx` — accepts `value` (0-100), `color`. Renders a small horizontal bar with rounded corners, filled portion colored by `color`, showing percentage text.

```jsx
export default function ProgressBar({ value, color }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value ?? 0}%`, backgroundColor: color }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create ChildCard component**

`src/components/ChildCard.jsx` — displays child name, grade, emoji, today's progress bar, sticker count. Uses child's theme colors. Clicking navigates to schedule page.

```jsx
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { getAchievementColor } from '../utils/achievement'

export default function ChildCard({ child, achievement, stickerCount }) {
  const color = getAchievementColor(achievement)
  return (
    <Link to={`/schedule/${child.id}`}
      className="block bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${child.color}` }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{child.emoji}</span>
        <div>
          <h3 className="font-bold text-[#3D3229]">{child.name}</h3>
          <span className="text-xs text-[#8C7B6B]">{child.grade}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm">
          <span>⭐</span>
          <span className="font-bold text-[#3D3229]">{stickerCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar value={achievement} color={color} />
        <span className="text-sm font-bold text-[#3D3229] min-w-[3rem] text-right">
          {achievement !== null ? `${achievement}%` : '-'}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create ScheduleTimeline component**

`src/components/ScheduleTimeline.jsx` — renders vertical timeline of schedule blocks for a single day. Each block shows time range + label, colored by type. Block colors per spec: school gray, academy child-color, homework yellow, free green, dinner orange, lesson purple.

```jsx
const TYPE_COLORS = {
  school: '#D4D0CC',
  homework: '#FFF3CD',
  free: '#D4EDDA',
  dinner: '#FFE0CC',
  lesson: '#E8D5F5',
  break: '#F3F4F6'
}

export default function ScheduleTimeline({ blocks, childColor }) {
  if (!blocks.length) return <p className="text-[#8C7B6B] text-sm">일정 없음</p>

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const bg = block.type === 'academy' ? childColor + '30' : TYPE_COLORS[block.type] || '#F3F4F6'
        const border = block.type === 'academy' ? childColor : 'transparent'
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{ backgroundColor: bg, borderLeft: `3px solid ${border}` }}>
            <span className="text-xs text-[#8C7B6B] min-w-[5rem]">
              {block.start} - {block.end}
            </span>
            <span className="text-sm font-bold text-[#3D3229]">{block.label}</span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create HomeworkChecklist component**

`src/components/HomeworkChecklist.jsx` — renders homework items with checkboxes, required/optional badges, photo upload button, and photo thumbnail. Calls `toggleComplete` and `uploadPhoto` from hook.

```jsx
import { Camera, Check, Clock } from 'lucide-react'

export default function HomeworkChecklist({ items, onToggle, onUploadPhoto }) {
  if (!items.length) return <p className="text-[#8C7B6B] text-sm">오늘 숙제 없음</p>

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 bg-white shadow-sm ${item.completed ? 'opacity-60' : ''}`}>
          <button onClick={() => onToggle(item.id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.completed ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-gray-300'}`}>
            {item.completed && <Check size={14} />}
          </button>
          <div className="flex-1">
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
            <img src={item.photoUrl} alt="인증" className="w-10 h-10 rounded-lg object-cover" />
          )}
          <label className="cursor-pointer text-[#8C7B6B] hover:text-[#F47458]">
            <Camera size={18} />
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files[0] && onUploadPhoto(item.id, e.target.files[0])} />
          </label>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create StickerPanel component**

`src/components/StickerPanel.jsx` — shows sticker total per child, plus a "스티커 주기" button that opens a simple modal to select sticker type (star/heart/crown) and sender name, then calls `giveSticker`.

```jsx
import { useState } from 'react'
import { Star, Heart, Crown, X } from 'lucide-react'

const STICKER_TYPES = [
  { type: 'star', icon: Star, label: '별' },
  { type: 'heart', icon: Heart, label: '하트' },
  { type: 'crown', icon: Crown, label: '왕관' },
]

export default function StickerPanel({ childName, stickers, onGiveSticker }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')

  const handleGive = (type) => {
    if (!from.trim()) return
    onGiveSticker(from.trim(), type)
    setOpen(false)
    setFrom('')
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span>⭐ {stickers.total}개</span>
        <button onClick={() => setOpen(true)}
          className="text-xs bg-[#F47458] text-white px-3 py-1 rounded-lg hover:bg-[#e0634a]">
          스티커 주기
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{childName}에게 스티커 주기</h3>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <input value={from} onChange={e => setFrom(e.target.value)}
              placeholder="보내는 사람 이름" className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" />
            <div className="flex justify-center gap-4">
              {STICKER_TYPES.map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => handleGive(type)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50">
                  <Icon size={28} className="text-[#F47458]" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Create Calendar component**

`src/components/Calendar.jsx` — renders a monthly calendar grid. Each day cell shows a small colored dot based on achievement rate (green/yellow/red). Accepts `achievementData` object `{ 'YYYY-MM-DD': number }`, `month`, `year`. Clicking a day calls `onSelectDate`.

```jsx
import { getAchievementColor } from '../utils/achievement'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar({ year, month, achievementData, onSelectDate, onChangeMonth }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onChangeMonth(-1)}><ChevronLeft size={20} /></button>
        <h3 className="font-bold text-[#3D3229]">{year}년 {monthNames[month]}</h3>
        <button onClick={() => onChangeMonth(1)}><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#8C7B6B] mb-2">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const rate = achievementData[dateStr] ?? null
          const color = getAchievementColor(rate)
          return (
            <button key={i} onClick={() => onSelectDate(dateStr)}
              className="aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-gray-50 text-sm">
              <span>{day}</span>
              {rate !== null && (
                <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: color }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create AdminPinModal component**

`src/components/AdminPinModal.jsx` — simple 4-digit PIN input modal. Compares against stored PIN (hardcoded initially as "1234").

```jsx
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
```

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "feat: add all shared UI components (ProgressBar, ChildCard, Timeline, Calendar, etc.)"
```

---

### Task 6: Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Implement Dashboard page**

`src/pages/Dashboard.jsx` — full implementation:
- Top: today's date display
- 3 ChildCard components in a responsive grid (1 col mobile, 3 col desktop)
- Monthly Calendar below with achievement data
- Loads homework for today for all 3 children to calculate achievement rates
- Loads sticker counts for all 3 children

Uses `useHomework` hook for each child, `useStickers` hook for each child, `calcAchievement` utility.

Key layout:
```jsx
<div>
  <h2 className="text-lg font-bold mb-1">오늘의 달성률</h2>
  <p className="text-sm text-[#8C7B6B] mb-4">{today formatted}</p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    {CHILD_IDS.map(id => <ChildCard key={id} ... />)}
  </div>
  <Calendar ... />
</div>
```

- [ ] **Step 2: Verify Dashboard renders**

```bash
npm run dev
```

Expected: Dashboard shows 3 child cards with progress bars and calendar.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: implement Dashboard page with achievement cards and calendar"
```

---

### Task 7: Schedule Page

**Files:**
- Modify: `src/pages/Schedule.jsx`

- [ ] **Step 1: Implement Schedule page**

`src/pages/Schedule.jsx` — full implementation:
- Uses `useParams()` to get child name from URL
- Top tabs for switching between children (주원/예원/채원)
- Day-of-week tab row (월~토) to select which day to view
- `ScheduleTimeline` for selected day
- `HomeworkChecklist` for today's homework
- `StickerPanel` for this child
- Uses `useHomework`, `useSchedule`, `useStickers` hooks

Layout structure:
```jsx
<div>
  {/* Child tabs */}
  <div className="flex gap-2 mb-4">...</div>
  {/* Day tabs */}
  <div className="flex gap-1 mb-6">...</div>
  {/* Two columns on desktop: timeline left, homework right */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <h3>시간표</h3>
      <ScheduleTimeline ... />
    </div>
    <div>
      <h3>오늘의 숙제</h3>
      <HomeworkChecklist ... />
      <StickerPanel ... />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify Schedule page renders**

Navigate to `/schedule/juwon`. Expected: day tabs, timeline blocks, homework checklist.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Schedule.jsx
git commit -m "feat: implement Schedule page with timeline and homework checklist"
```

---

### Task 8: Admin Page

**Files:**
- Modify: `src/pages/Admin.jsx`

- [ ] **Step 1: Implement Admin page**

`src/pages/Admin.jsx` — full implementation:
- Shows `AdminPinModal` first. On success, shows admin controls.
- **Schedule Editor**: Select child + day, view/edit/add/delete blocks. Each block has start, end, type, label fields.
- **Homework Template Editor**: Select child, view/edit required vs optional homework items.
- **Sticker Management**: View sticker counts per child, reset button.
- Writes changes to Firestore (or to local data templates — for MVP, admin edits the static data and requires a code redeploy, unless we persist to Firestore).

For MVP: Admin edits are stored in Firestore under `/admin/schedules/{childId}/{dayOfWeek}` and `/admin/homeworkTemplates/{childId}`. The hooks check Firestore first, fall back to static data.

- [ ] **Step 2: Verify Admin page**

Navigate to `/admin`, enter PIN "1234". Expected: schedule and homework editors appear.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Admin.jsx
git commit -m "feat: implement Admin page with schedule and homework editors"
```

---

### Task 9: Firestore Seed Script

**Files:**
- Create: `src/utils/seedFirestore.js`

- [ ] **Step 1: Create seed script**

`src/utils/seedFirestore.js` — a function that initializes Firestore with:
- `/children/{juwon,yewon,chaewon}` documents
- `/stickers/{juwon,yewon,chaewon}` with `{ total: 0, history: [] }`
- `/settings` with `{ adminPin: '1234', dinnerTime: '19:30' }`

Called once from a button in Admin page or from browser console.

- [ ] **Step 2: Add seed button to Admin page**

Add a "초기 데이터 설정" button that calls the seed function.

- [ ] **Step 3: Commit**

```bash
git add src/utils/seedFirestore.js src/pages/Admin.jsx
git commit -m "feat: add Firestore seed script for initial data"
```

---

### Task 10: Design Polish & Responsive

**Files:**
- Modify: `src/index.css`, `src/components/Layout.jsx`, all components as needed

- [ ] **Step 1: Global styles**

`src/index.css` — add global body styles:
```css
body {
  font-family: 'NanumSquareRound', sans-serif;
  color: #3D3229;
  background-color: #FDF8F0;
}
```

- [ ] **Step 2: Mobile-first responsive adjustments**

- Layout: mobile hamburger menu or bottom nav for small screens
- Dashboard cards: `grid-cols-1` on mobile, `grid-cols-3` on `md:`
- Schedule: single column on mobile, 2 columns on `lg:`
- Calendar: full width always, smaller text on mobile
- Touch-friendly: larger tap targets on checkboxes and buttons (min 44px)

- [ ] **Step 3: Visual polish**

- Verify all components use spec colors: ivory background, white cards, rounded corners
- Add subtle hover animations on cards
- Ensure sticker emoji renders correctly across devices
- Test with NanumSquareRound font loading

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/Layout.jsx src/components/ src/pages/
git commit -m "style: apply design system polish and mobile responsive layout"
```

---

### Task 11: Firebase Deployment

**Files:**
- Modify: `firebase.json`, `.firebaserc`

- [ ] **Step 1: Build the app**

```bash
npm run build
```

Expected: `dist/` folder created with production build.

- [ ] **Step 2: Install Firebase CLI and login**

```bash
npm install -g firebase-tools
firebase login
```

- [ ] **Step 3: Initialize Firebase project**

```bash
firebase init
```

Select: Hosting, Firestore. Set public directory to `dist`. Configure as SPA (rewrite all to index.html).

- [ ] **Step 4: Deploy**

```bash
firebase deploy
```

Expected: Site deployed to `https://<project-id>.web.app`

- [ ] **Step 5: Commit**

```bash
git add firebase.json .firebaserc
git commit -m "chore: configure Firebase Hosting deployment"
```

---

### Task 12: Push Notifications (FCM) — Optional Enhancement

**Files:**
- Create: `public/firebase-messaging-sw.js`, `src/utils/notifications.js`

- [ ] **Step 1: Set up FCM service worker**

`public/firebase-messaging-sw.js`:
```js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({ /* same config */ })
const messaging = firebase.messaging()
```

- [ ] **Step 2: Create notification utility**

`src/utils/notifications.js` — requests notification permission, gets FCM token, saves to Firestore under `/devices/{childId}`. Includes a function to check achievement at 7 PM and trigger notification.

- [ ] **Step 3: Add notification permission request to Schedule page**

Add a "알림 받기" toggle button on the Schedule page that requests browser notification permission.

- [ ] **Step 4: Commit**

```bash
git add public/firebase-messaging-sw.js src/utils/notifications.js
git commit -m "feat: add FCM push notification support for low achievement alerts"
```

---

## Execution Notes

- Tasks 1-5 are sequential (each depends on previous)
- Tasks 6, 7, 8 can be parallelized after Task 5
- Task 9 depends on Task 2
- Task 10 depends on Tasks 6-8
- Task 11 depends on Task 10
- Task 12 is optional, can be done independently after Task 4
