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

  // 🆕 состояния загрузки и ошибки
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        setLoading(true)
        setError(null)

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
        if (!cancelled) {
          setError('Не удалось загрузить фотографии.')
          setGroups([])
        }
      } finally {
        if (!cancelled) setLoading(false)
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

  // 🌀 Пока идёт загрузка
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-400">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
        Загрузка фотографий...
      </div>
    )
  }

  // ❌ Если ошибка
  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    )
  }

  return (
    <>
      {/* 📭 Если нет фотографий */}
      {groups.length === 0 && (
        <div className="card center text-gray-400" style={{ minHeight: 120 }}>
          Нет фотографий в галерее
        </div>
      )}

      {/* 🖼️ Галерея */}
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

      {/* 💡 Lightbox */}
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
