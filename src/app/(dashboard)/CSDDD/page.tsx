import CSDDD from './csddd'

export const metadata = {
  title: '공급망 실사',
  description: 'NSMM csddd page'
}

export default function CSDDDPage() {
  return (
    <div className="flex flex-col w-full max-w-6xl px-4 py-10 mx-auto">
      <CSDDD />
    </div>
  )
}
