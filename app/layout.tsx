import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/ConditionalLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FullColor - Cotizador de Productos Personalizados",
  description:
    "Cotiza tus productos personalizados con FullColor. Impresión de alta calidad y merchandising corporativo.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
