import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { PollProvider } from '@/contexts/PollContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Event Org - Interactive Polling Platform',
  description: 'Create and share interactive polls like Mentimeter. Real-time voting, multiple question types, and beautiful visualizations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PollProvider>
            {children}
          </PollProvider>
        </AuthProvider>
      </body>
    </html>
  )
}