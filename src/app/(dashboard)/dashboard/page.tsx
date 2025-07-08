import ScopeDashboard from './scopeDashboard'
import CSDDDDashboard from './CSDDDDashboard'

export default function Dashboard() {
  return (
    <div className="flex flex-col flex-1">
      <ScopeDashboard />
      <CSDDDDashboard />
    </div>
  )
}
