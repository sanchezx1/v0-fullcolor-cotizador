import { MessageCircle } from "lucide-react"
import Link from "next/link"

interface WhatsAppHelpProps {
  variant?: "inline" | "floating"
  message?: string
}

export function WhatsAppHelp({ variant = "inline", message: _message }: WhatsAppHelpProps) {
  const whatsappUrl = "https://wa.me/message/NMOTUO5GTAI3C1"

  if (variant === "floating") {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-105 hover:bg-[#20BA5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Chatee con FullColor por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 rounded-full border border-[#25D366]/20 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_18px_50px_-28px_rgba(37,211,102,0.65)] transition hover:-translate-y-0.5 hover:border-[#25D366] hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]/60"
      aria-label="Abrir chat de WhatsApp con FullColor"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="leading-relaxed text-left">
        <span className="block text-xs uppercase tracking-wide text-slate-500">Chat en vivo</span>
        Chatee con nosotros
      </span>
    </Link>
  )
}
