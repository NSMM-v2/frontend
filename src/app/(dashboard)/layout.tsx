import NavigationBar from '@/components/layout/navBar'
import SideBar from '@/components/layout/sideBar'

// layout.tsx
export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar />
      <SideBar />
      <div className="flex flex-1 max-w-screen-xl mt-20">{children}</div>
    </div>
  )
}
