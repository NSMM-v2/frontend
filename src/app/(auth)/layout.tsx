// layout.tsx
export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex flex-1">{children}</div>
    </div>
  )
}
