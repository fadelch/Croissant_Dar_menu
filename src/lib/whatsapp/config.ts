const WHATSAPP_NUMBER_PATTERN = /^[1-9]\d{6,14}$/;

export function parseWhatsAppNumber(value: string | undefined): string | null {
  if (!value || !WHATSAPP_NUMBER_PATTERN.test(value)) {
    return null;
  }

  return value;
}

export const configuredWhatsAppNumber = parseWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
);

