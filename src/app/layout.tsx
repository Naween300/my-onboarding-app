import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SupabaseProvider } from '@/contexts/SupabaseContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SME Intelligence - AI-Powered Business Insights',
  description: 'AI-powered business insights and content generation for small and medium enterprises',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1f2937',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg border border-gray-200',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          dividerLine: 'bg-gray-300',
          dividerText: 'text-gray-500',
          formFieldLabel: 'text-gray-700',
          formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <SupabaseProvider>
            <div suppressHydrationWarning>
              {children}
            </div>
          </SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
