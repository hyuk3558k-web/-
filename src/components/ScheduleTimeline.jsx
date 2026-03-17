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
