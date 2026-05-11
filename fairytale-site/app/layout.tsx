import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Казковий Край — нова казка кожного ранку',
  description: 'Чарівні українські казки для дітей. Нова казка з\'являється кожного ранку о 7:00.',
  openGraph: {
    title: 'Казковий Край',
    description: 'Нова казка щодня о 7:00 ранку 🌙',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  )
}
