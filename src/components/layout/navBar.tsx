import {EarthLock} from 'lucide-react'
import Link from 'next/link'

export default function NavigationBar() {
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-20 p-4 bg-white shadow-sm">
      <div className="flex flex-row items-center justify-between w-full h-full">
        <Link href="/" className="flex flex-row items-center w-full gap-2">
          <EarthLock className="w-10 h-10 text-blue-400" />
          <span className="text-2xl font-bold text-blue-400">NSMM</span>
        </Link>
        <div className="flex flex-row whitespace-nowrap">프로필</div>
      </div>
    </div>
  )
}
