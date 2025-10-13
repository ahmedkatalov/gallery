import { useState } from 'react'
import { getImageUrl, api } from '../api'
import { toast } from 'react-toastify'
import ShareModal from './ShareModal'

export default function GroupCard({ group, onClick, onDeleted }) {
  const [shareOpen, setShareOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isOwner = localStorage.getItem('isOwner') === 'true'
  const ownerCode = localStorage.getItem('ownerCode') || ''

  const first = group?.photos?.[0]
  if (!first) return null

  const onDelete = async () => {
    try {
      if (!ownerCode.trim()) {
        toast.error('Секретный код не найден. Войдите снова как владелец.')
        return
      }
      await api.delete(`/api/photos/${first.id}?code=${encodeURIComponent(ownerCode)}`)
      toast.success('Группа удалена')
      setConfirmOpen(false)
      onDeleted?.()
    } catch (err) {
      toast.error('Ошибка удаления: ' + (err?.response?.data || err.message))
    }
  }

  // ✅ ВАЖНО: используем group.group_id (а не group.id)
  const groupId = group.group_id
  const shareUrl = `${window.location.origin}/${group.category}/${groupId}?photo=0`

  return (
    <div className="card">
      <img
        className="thumb"
        src={getImageUrl(first.filename)}
        alt={first.description || 'Фото'}
        onClick={() => onClick?.(0)}
      />

      {first.description && <div className="mt-1">{first.description}</div>}

      <div className="badge mt-1">
        Категория: {group.category === 'gates' ? 'Ворота' : group.category === 'rails' ? 'Перила' : 'Навесы'}
      </div>

      {isOwner ? (
        <div className="flex gap-2 mt-2 flex-wrap">
          <button className="btn" onClick={() => setShareOpen(true)}>Поделиться</button>
          <button className="btn danger" onClick={() => setConfirmOpen(true)}>Удалить</button>
        </div>
      ) : (
        <div className="mt-2">
          <button
            onClick={() => setShareOpen(true)}
            className="w-full py-2 rounded-xl bg-[#25D366]/30 border border-[#25D366]/40 text-white font-medium shadow-md hover:bg-[#25D366]/40 transition"
          >
            Поделиться в WhatsApp
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-[#0b0f16]/95 p-6 rounded-2xl border border-white/10 text-white max-w-sm w-[90%] shadow-lg animate-[slideUp_0.25s_ease-out]">
            <h3 className="text-lg font-semibold mb-3">Удалить фотографии?</h3>
            <p className="text-gray-300 text-sm mb-5">Это действие нельзя отменить.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white/80 bg-white/5 hover:bg-white/10 transition"
                onClick={() => setConfirmOpen(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition shadow-md"
                onClick={onDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⬇️ Передаём и category, и правильный groupId; текст — готовая ссылка */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        defaultPhone={import.meta.env.VITE_WHATSAPP_PHONE}
        category={group.category}
        groupId={groupId}
        shareText={`Посмотри изделие: ${shareUrl}`}
      />
    </div>
  )
}
