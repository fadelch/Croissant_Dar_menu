import { parseWhatsAppNumber } from "@/lib/whatsapp/config";

export function buildWhatsAppUrl(number: string | undefined, message: string): string | null {
  const validNumber = parseWhatsAppNumber(number);

  if (!validNumber) {
    return null;
  }

  return `https://wa.me/${validNumber}?text=${encodeURIComponent(message)}`;
}

