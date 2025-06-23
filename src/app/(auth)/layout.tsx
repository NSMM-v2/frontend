// layout.tsx
export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-1">{children}</div>
    </div>
  )
}
