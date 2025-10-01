import { useMemo } from 'react'
import { buildWhatsAppShareUrl } from '../utils/whatsapp'

export default function ShareModal({
  open,
  onClose,
  defaultPhone = '',
  category,
  groupId,
  shareText = ''
}) {
  if (!open) return null

  const normDefaultPhone = useMemo(
    () => (defaultPhone || '').replace(/[^\d]/g, ''),
    [defaultPhone]
  )

  // базовая ссылка (на случай, если shareText пустой)
  const shareUrl = useMemo(() => {
    const base = window.location.origin
    if (category && groupId) return `${base}/${category}/${groupId}`
    if (category) return `${base}/${category}`
    return base
  }, [category, groupId])

  // finalShareText — теперь только shareText или fallback
  const finalShareText = shareText || shareUrl

  const waToManufacturer = () => {
    if (!normDefaultPhone) return
    const href = buildWhatsAppShareUrl(normDefaultPhone, finalShareText)
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose?.()
  }

  const waGeneric = () => {
    const href = `https://wa.me/?text=${encodeURIComponent(finalShareText)}`
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose?.()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(finalShareText)
      alert('Ссылка скопирована!')
    } catch {
      alert('Не удалось скопировать ссылку')
    }
  }

  const systemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: finalShareText })
        onClose?.()
      } catch {}
    } else {
      copyLink()
    }
  }

  return (
    <div className="modal-backdrop fancy" onClick={onClose}>
      <div
        className="modal-box slide-up"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Поделиться</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#b9c7d9' }}>Отправить производителю</div>
            <button
              className="btn primary"
              onClick={waToManufacturer}
              disabled={!normDefaultPhone}
              title={!normDefaultPhone ? 'Укажи VITE_WHATSAPP_PHONE в .env' : ''}
            >
              WhatsApp производителю
            </button>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', margin: '6px -6px', paddingTop: 6 }} />

          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#b9c7d9' }}>Отправить другому</div>
            <button className="btn" onClick={waGeneric}>Открыть WhatsApp и выбрать чат</button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            <button className="btn outline" onClick={systemShare}>Системный Share / Скопировать</button>
            <button className="btn" onClick={copyLink}>Скопировать ссылку</button>
          </div>
        </div>
      </div>
    </div>
  )
}
