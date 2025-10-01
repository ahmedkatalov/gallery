import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api'
import GroupCard from './GroupCard'
import Lightbox from './Lightbox'

export default function Gallery({ category, groupId }) {
  const [groups, setGroups] = useState([])
  const [lightbox, setLightbox] = useState({ open: false, g: 0, i: 0 })
  const location = useLocation()

  const safeParseArray = (v) => {
    try {
      const parsed = typeof v === 'string' ? JSON.parse(v) : v
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  // Загружаем группы
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const config = category ? { params: { category } } : undefined
        const { data } = await api.get('/api/photos', config)

        let normalized = (Array.isArray(data) ? data : []).map(g => ({
          group_id: g.group_id,
          category: g.category || category || null,
          photos: Array.isArray(g.photos) ? g.photos : safeParseArray(g.photos),
        }))

        if (groupId) normalized = normalized.filter(g => g.group_id === groupId)
        if (!cancelled) setGroups(normalized)
      } catch (e) {
        console.error('Failed to load groups:', e)
        if (!cancelled) setGroups([])
      }
    })()
    return () => { cancelled = true }
  }, [category, groupId])

  // Проверяем URL на photoIndex и открываем Lightbox
  useEffect(() => {
    if (!groups.length || !groupId) return
    const params = new URLSearchParams(location.search)
    const photoIndex = parseInt(params.get('photo') || '0', 10)
    const gi = groups.findIndex(g => g.group_id === groupId)
    if (gi >= 0) setLightbox({ open: true, g: gi, i: photoIndex })
  }, [groups, groupId, location.search])

  const open = (groupIndex, photoIndex) => setLightbox({ open: true, g: groupIndex, i: photoIndex })
  const close = () => setLightbox({ open: false, g: 0, i: 0 })

  return (
    <>
      {groups.length === 0 && <div className="card center" style={{ minHeight: 120 }}>Пока нет фото</div>}

      <div className="grid">
        {groups.map((group, gi) => (
          <GroupCard
            key={group.group_id || gi}
            group={group}
            onClick={(pi) => open(gi, pi)}
            onDeleted={() => setGroups(prev => prev.filter((_, idx) => idx !== gi))}
          />
        ))}
      </div>

      {lightbox.open && groups[lightbox.g] && (
        <Lightbox
          photos={groups[lightbox.g].photos}
          index={lightbox.i}
          onClose={close}
          onPrev={() =>
            setLightbox(s => ({ ...s, i: (s.i - 1 + groups[s.g].photos.length) % groups[s.g].photos.length }))
          }
          onNext={() =>
            setLightbox(s => ({ ...s, i: (s.i + 1) % groups[s.g].photos.length }))
          }
        />
      )}
    </>
  )
}
