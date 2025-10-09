import { useMemo, useState } from 'react'
import { getImageUrl } from '../api'
import { toast } from 'react-toastify'
import { api } from '../api'
import ShareModal from './ShareModal'

export default function GroupCard({ group, onClick, onDeleted }) {
  const [shareOpen, setShareOpen] = useState(false)
  const phone = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const first = group?.photos?.[0]
  if (!first) return null

  const shareText = useMemo(() => {
    // ссылка на конкретное фото (индекс 0)
    return `Посмотри изделие: ${window.location.origin}/${group.category}/${group.group_id}?photo=0`
  }, [group.category, group.group_id])

  const onDelete = async () => {
    const code = prompt('Введите секретный код для удаления:')
    if (!code) return
    try {
      await api.delete(`/api/photos/${first.id}?code=${encodeURIComponent(code)}`)
      toast.success('Группа удалена')
      onDeleted?.()
    } catch (err) {
      toast.error('Ошибка удаления: ' + (err?.response?.data || err.message))
    }
  }

  const canOpen = typeof onClick === 'function'
  const openFirst = () => canOpen && onClick(0)

  return (
    <div className="card">
      <img
        className="thumb"
        src={getImageUrl(first.filename)}
        alt={first.description || 'Фото'}
        onClick={canOpen ? openFirst : undefined}
        role={canOpen ? 'button' : undefined}
        aria-disabled={canOpen ? undefined : true}
        style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, cursor: canOpen ? 'pointer' : 'default' }}
      />

      {first.description && <div className="mt-1">{first.description}</div>}

      <div className="row mt-2" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => setShareOpen(true)}>Поделиться</button>
        <button className="btn danger" onClick={onDelete}>Удалить</button>
      </div>

      <div className="badge mt-1 ">
        Категория: {group.category === 'gates' ? 'Ворота' : group.category === 'rails' ? 'Перила' : 'Навесы'}
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        defaultPhone={phone}
        category={group.category}
        groupId={group.group_id}
        shareText={shareText}  // 🔹 сюда передаём только нужный текст
      />
    </div>
  )
}
