import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { VideoCallProvider } from '@/contexts/VideoCallProvider'
import IncomingCallModal from '@/components/video/IncomingCallModal'
import VideoCallWindow from '@/components/video/VideoCallWindow'
import { LoaderProvider } from '@/contexts/LoaderContext'
import Loader from '@/components/Loader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Healthcare Accessibility App',
  description: 'Comprehensive healthcare management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <LoaderProvider>
            <Loader />
            <VideoCallProvider>
              {children}
              <IncomingCallModal />
              <VideoCallWindow />
              <ToastContainer position="top-right" autoClose={3000} />
            </VideoCallProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

