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
