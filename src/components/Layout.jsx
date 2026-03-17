import { Outlet, Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#FDF8F0] font-['NanumSquareRound']">
      <header className="bg-white shadow-sm px-3 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg sm:text-xl font-extrabold text-[#3D3229]">
            서씨네 시간표
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/schedule/juwon"
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                location.pathname === '/schedule/juwon' ? 'bg-[#6B9FD6] text-white' : 'bg-[#E8F1FA] text-[#6B9FD6]'
              }`}>주원</Link>
            <Link to="/schedule/yewon"
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                location.pathname === '/schedule/yewon' ? 'bg-[#E8859A] text-white' : 'bg-[#FDE8ED] text-[#E8859A]'
              }`}>예원</Link>
            <Link to="/schedule/chaewon"
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                location.pathname === '/schedule/chaewon' ? 'bg-[#6BC5B8] text-white' : 'bg-[#E5F5F2] text-[#6BC5B8]'
              }`}>채원</Link>
            <Link to="/admin" className="p-1.5 rounded-lg hover:bg-gray-100 text-[#8C7B6B]">
              <Settings size={18} />
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}
