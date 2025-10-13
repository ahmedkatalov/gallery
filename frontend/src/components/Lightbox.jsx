import { useEffect, useRef } from 'react'
import { getImageUrl } from '../api'

export default function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos?.[index]
  const touchStart = useRef(null)
  const touchEnd = useRef(null)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  // 👇 Обработка свайпа для телефонов
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEnd.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    const diff = touchStart.current - touchEnd.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) onNext?.()
      else onPrev?.()
    }
    touchStart.current = null
    touchEnd.current = null
  }

  if (!photo) return null

  const src = getImageUrl(photo.filename)
  const total = photos.length
  const current = index + 1

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[1000]
                 animate-[fadeIn_0.25s_ease-out]"
      onClick={onClose}
    >
      {/* === Навигационные индикаторы === */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        {photos.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] scale-110'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* === Фото === */}
      <img
        src={src}
        alt={photo.description || 'Фото'}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl border border-white/10
                   shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-[zoomIn_0.25s_ease-out]
                   select-none touch-pan-y"
        draggable={false}
      />

      {/* === Описание === */}
      {photo.description && (
        <div className="mt-4 text-gray-200 text-center text-sm px-4 max-w-[90%]">
          {photo.description}
        </div>
      )}

      {/* === Кнопки управления === */}
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 flex-wrap px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm 
                     border border-white/20 backdrop-blur-md shadow-md transition-all hover:scale-[1.03]"
        >
          ← Назад
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm 
                     border border-white/20 backdrop-blur-md shadow-md transition-all hover:scale-[1.03]"
        >
          Вперёд →
        </button>

        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-red-500/70 hover:bg-red-600/80 text-white text-sm 
                     shadow-md transition-all hover:scale-[1.05]"
        >
          Закрыть
        </button>
      </div>

      {/* === Анимации === */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes zoomIn {
          from { transform: scale(0.96); opacity: 0.8; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
