import './globals.css'

// RootLayout.tsx
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </body>
    </html>
  )
}
