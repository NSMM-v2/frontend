import './globals.css'
import {Toaster} from 'react-hot-toast'

// RootLayout.tsx
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxWidth: '420px'
            }
          }}
        />
      </body>
    </html>
  )
}
