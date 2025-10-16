import { MessageCircle } from "lucide-react"
import Link from "next/link"

interface WhatsAppHelpProps {
  variant?: "inline" | "floating"
  message?: string
}

export function WhatsAppHelp({ variant = "inline", message }: WhatsAppHelpProps) {
  const whatsappNumber = "593999999999" // Replace with actual number
  const defaultMessage = "Hola, necesito ayuda con mi cotización"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message || defaultMessage)}`

  if (variant === "floating") {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </Link>
    )
  }

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-[15px] text-muted-foreground hover:text-foreground transition-colors group"
    >
      <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
      <span className="leading-relaxed">
        {"¿Necesitas ayuda? "}
        <span className="underline decoration-[#25D366]/40 group-hover:decoration-[#25D366] transition-colors">
          {"Contáctanos por WhatsApp"}
        </span>
      </span>
    </Link>
  )
}
