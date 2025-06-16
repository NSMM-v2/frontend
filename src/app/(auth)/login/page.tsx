import {Metadata} from 'next'
import LogIn from './logIn'

export const metadata: Metadata = {
  title: '로그인',
  description: 'NSMM'
}

export default function LogInPage() {
  return (
    <div className="flex flex-col w-full h-screen">
      <div>
        <LogIn />
      </div>
    </div>
  )
}
