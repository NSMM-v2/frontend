import {Metadata} from 'next'
import Login from './login'

export const metadata: Metadata = {
  title: '로그인',
  description: 'NSMM'
}

export default function LogInPage() {
  return (
    <div className="flex flex-1 justify-center items-center">
      <Login />
    </div>
  )
}
