import {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '랜딩페이지',
  description: 'NSMM'
}

export default function Home() {
  return (
    <div className="flex flex-row w-full h-screen justify-center items-center">
      <Link href="/login">
        <button className="w-24 h-12 rounded-xl hover:cursor-pointer text-white bg-black">
          로그인
        </button>
      </Link>
    </div>
  )
}
