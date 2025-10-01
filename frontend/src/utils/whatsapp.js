export function buildWhatsAppShareUrl(phone, text) {
  const normalized = (phone || '').replace(/[^\d]/g, '')
  const encoded = encodeURIComponent(text)
  return normalized
    ? `https://wa.me/${normalized}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
}