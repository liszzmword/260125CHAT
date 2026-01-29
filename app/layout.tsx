import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '뉴스 AI 챗봇',
  description: '구글 뉴스를 수집하고 AI와 대화하세요',
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
