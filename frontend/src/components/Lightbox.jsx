import { useEffect } from 'react'
import { getImageUrl } from '../api'

export default function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos?.[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  if (!photo) return null
  const src = getImageUrl(photo.filename)
  const total = photos.length
  const current = index + 1

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-counter">{current} / {total}</div>
      <img
        className="lightbox-img"
        src={src}
        alt={photo.description || 'Фото'}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="lightbox-nav">
        <button className="btn" onClick={(e) => { e.stopPropagation(); onPrev?.() }}>← Назад</button>
        <button className="btn" onClick={(e) => { e.stopPropagation(); onNext?.() }}>Вперёд →</button>
        <button className="btn danger" onClick={(e) => { e.stopPropagation(); onClose?.() }}>Закрыть</button>
      </div>
    </div>
  )
}
