import CSDDD from './csddd'

export const metadata = {
  title: '공급망 실사',
  description: 'NSMM csddd page'
}

export default function CSDDDPage() {
  return (
    <div className="flex items-center justify-center flex-1">
      <CSDDD />
    </div>
  )
}
