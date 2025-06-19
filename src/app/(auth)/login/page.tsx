import {Metadata} from 'next'
import Login from './login'

export const metadata: Metadata = {
  title: '로그인',
  description: 'NSMM'
}

export default function LogInPage() {
  return (
    <div className="flex items-center justify-center flex-1">
      <Login />
    </div>
  )
}
