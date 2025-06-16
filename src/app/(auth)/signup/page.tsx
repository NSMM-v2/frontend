import {Metadata} from 'next'
import SignUp from './signup'

export const metadata: Metadata = {
  title: '회원가입',
  description: 'NSMM'
}

export default function SignUpPage() {
  return (
    <div className="flex flex-1 justify-center items-center">
      <SignUp />
    </div>
  )
}
