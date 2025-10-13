import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { api } from '../api'
import GroupCard from './GroupCard'
import Lightbox from './Lightbox'

export default function Gallery({ category: propCategory }) {
  const { groupId: routeGroupId } = useParams()
  const location = useLocation()
  const [groups, setGroups] = useState([])
  const [lightbox, setLightbox] = useState({ open: false, g: 0, i: 0 })
  const [groupId, setGroupId] = useState(routeGroupId || null)

  // безопасный парсер массивов
  const safeParseArray = (v) => {
    try {
      const parsed = typeof v === 'string' ? JSON.parse(v) : v
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  // Загружаем все группы
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const config = propCategory ? { params: { category: propCategory } } : undefined
        const { data } = await api.get('/api/photos', config)

        let normalized = (Array.isArray(data) ? data : []).map(g => ({
          group_id: g.group_id,
          category: g.category || propCategory || null,
          photos: Array.isArray(g.photos) ? g.photos : safeParseArray(g.photos),
        }))

        if (!cancelled) setGroups(normalized)
      } catch (e) {
        console.error('Ошибка загрузки:', e)
        if (!cancelled) setGroups([])
      }
    })()

    return () => { cancelled = true }
  }, [propCategory])

  // Открываем Lightbox по URL параметрам
  useEffect(() => {
    if (!groups.length) return
    const params = new URLSearchParams(location.search)
    const photoIndex = parseInt(params.get('photo') || '0', 10)
    const gid = routeGroupId
    if (!gid) return

    const gi = groups.findIndex(g => g.group_id === gid)
    if (gi >= 0) {
      setLightbox({ open: true, g: gi, i: photoIndex })
    }
  }, [groups, routeGroupId, location.search])

  // Закрываем Lightbox и возвращаемся к полному списку
  const closeLightbox = () => {
    setLightbox({ open: false, g: 0, i: 0 })
    setGroupId(null)
    window.history.replaceState({}, '', `/${propCategory}`) // 🧠 очищаем URL от groupId и ?photo
  }

  const open = (groupIndex, photoIndex) => setLightbox({ open: true, g: groupIndex, i: photoIndex })

  return (
    <>
      {groups.length === 0 && (
        <div className="card center" style={{ minHeight: 120 }}>Пока нет фото</div>
      )}

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
          onClose={closeLightbox}
          onPrev={() =>
            setLightbox(s => ({
              ...s,
              i: (s.i - 1 + groups[s.g].photos.length) % groups[s.g].photos.length,
            }))
          }
          onNext={() =>
            setLightbox(s => ({
              ...s,
              i: (s.i + 1) % groups[s.g].photos.length,
            }))
          }
        />
      )}
    </>
  )
}
