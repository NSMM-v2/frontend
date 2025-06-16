import './globals.css'

// RootLayout.tsx
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
