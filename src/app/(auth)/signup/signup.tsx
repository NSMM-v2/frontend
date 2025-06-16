import Link from 'next/link'
import InputWithIcon from '@/components/inputWithIcon'
import {
  Mail,
  User,
  Phone,
  Building,
  Briefcase,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function SignUp() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col w-[400px] h-full bg-white shadow-md border rounded-lg justify-center items-center p-4 space-y-4">
        <span className="text-2xl font-bold">회원가입</span>
        <InputWithIcon
          header="이름"
          placeholder="이름"
          icon={<User className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="이메일"
          placeholder="이메일"
          icon={<Mail className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="전화번호"
          placeholder="전화번호"
          icon={<Phone className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="회사명"
          placeholder="회사명"
          icon={<Building className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="직급"
          placeholder="직급"
          icon={<Briefcase className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="비밀번호"
          placeholder="비밀번호"
          icon={<Lock className="w-4 h-4 text-black" />}
        />
        <InputWithIcon
          header="비밀번호 확인"
          placeholder="비밀번호 확인"
          icon={<CheckCircle className="w-4 h-4 text-black" />}
        />
        <Link href="/dashboard">
          <button className="flex flex-row items-center justify-center gap-2 w-28 h-10 rounded-lg bg-black text-white hover:cursor-pointer">
            <span>회원가입</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex flex-row w-full justify-center space-x-2 text-sm">
          <span className="text-gray-500">이미 계정이 있으신가요?</span>
          <Link href="/login">
            <span className="text-blue-400 hover:underline">로그인</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
