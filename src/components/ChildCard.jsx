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
