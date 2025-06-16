import Link from 'next/link'
import {Lock, Mail, Building, ArrowRight} from 'lucide-react'
import InputWithIcon from '@/components/inputWithIcon'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'

export default function LogIn() {
  return (
    <div className="flex flex-col">
      <Tabs defaultValue="headQuarters" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="headQuarters" className="hover:cursor-pointer">
            원청사
          </TabsTrigger>
          <TabsTrigger value="partner" className="hover:cursor-pointer">
            협력사
          </TabsTrigger>
        </TabsList>
        <TabsContent value="headQuarters">
          <div className="flex flex-col w-[400px] h-full bg-white shadow-lg rounded-lg justify-center items-center p-6 space-y-4 px-8">
            <span className="text-2xl font-bold">로그인</span>
            <InputWithIcon
              header="이메일"
              placeholder="이메일"
              icon={<Mail className="w-4 h-4 text-black" />}
            />
            <InputWithIcon
              header="비밀번호"
              placeholder="비밀번호"
              icon={<Lock className="w-4 h-4 text-black" />}
            />
            <Link href="/dashboard">
              <button className="flex flex-row items-center justify-center gap-2 w-24 h-10 rounded-lg bg-black text-white hover:cursor-pointer">
                로그인
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <div className="flex flex-row w-full justify-center space-x-2 text-sm">
              <span className="text-gray-500">계정이 없으신가요?</span>
              <Link href="/signup">
                <span className="text-blue-400 hover:underline">계정 생성</span>
              </Link>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="partner">
          <div className="flex flex-col w-98 h-full bg-white shadow-lg rounded-lg justify-center items-center p-6 space-y-4 px-8">
            <span className="text-2xl font-bold">로그인</span>
            <InputWithIcon
              header="회사번호"
              placeholder="회사번호"
              icon={<Building className="w-4 h-4 text-black" />}
            />
            <InputWithIcon
              header="이메일"
              placeholder="이메일"
              icon={<Mail className="w-4 h-4 text-black" />}
            />
            <InputWithIcon
              header="비밀번호"
              placeholder="비밀번호"
              icon={<Lock className="w-4 h-4 text-black" />}
            />
            <Link href="/dashboard">
              <button className="flex flex-row items-center justify-center gap-2 w-24 h-10 rounded-lg bg-black text-white hover:cursor-pointer">
                <span>로그인</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
