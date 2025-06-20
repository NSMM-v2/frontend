import ScopeDashboard from './scopeDashboard'
import CSDDDDashboard from './CSDDDDashboard'

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <ScopeDashboard />
      <CSDDDDashboard />
    </div>
  )
}
