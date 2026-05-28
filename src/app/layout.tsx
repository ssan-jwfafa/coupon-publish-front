import type { Metadata } from 'next'
import '../index.css'
import '../App.css'

export const metadata: Metadata = {
  title: 'Coupon Publish',
  description: '쿠폰 발급 및 실시간 주문 관리 운영 화면',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
