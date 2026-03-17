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
