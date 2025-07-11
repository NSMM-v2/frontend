import ScopeDashboard from './scopeDashboard'
import CSDDDDashboard from './CSDDDDashboard'

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full h-full">
      <ScopeDashboard />
      <CSDDDDashboard />
    </div>
  )
}
