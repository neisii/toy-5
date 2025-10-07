import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '쇼핑몰',
  description: 'Next.js 쇼핑몰 프로젝트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
