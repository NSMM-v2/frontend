import {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '랜딩페이지',
  description: 'NSMM'
}

export default function Home() {
  return (
    <div className="flex flex-row items-center justify-center w-full h-screen">
      <Link href="/login">
        <button className="w-24 h-12 text-white bg-black rounded-xl hover:cursor-pointer">
          로그인
        </button>
      </Link>
    </div>
  )
}
