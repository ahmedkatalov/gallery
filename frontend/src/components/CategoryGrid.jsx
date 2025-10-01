import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CategoryGrid() {
  const cards = [
    { key: 'gates',  to: '/gates',  title: 'Ворота',  cover: '/covers/gates.jpg',  emojiFallback: '🚪' },
    { key: 'rails',  to: '/rails',  title: 'Перила',  cover: '/covers/rails.jpg',  emojiFallback: '🪜' },
    { key: 'canopy', to: '/canopy', title: 'Навесы',  cover: '/covers/canopy.jpg', emojiFallback: '🏠' },
  ]

  const onImgError = (e, emoji) => {
    e.currentTarget.style.display = 'none'
    const wrapper = e.currentTarget.parentElement
    const emojiNode = document.createElement('div')
    emojiNode.className = 'category-card__emoji'
    emojiNode.textContent = emoji
    wrapper.appendChild(emojiNode)
  }

  // WhatsApp
  const phoneRaw = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const phoneDigits = phoneRaw.replace(/[^\d]/g, '')
  const waText = `Здравствуйте! Пишу из сайта "Кованые изделия"`
  const waHref = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}`
    : null

  // === НАСТРОЙКА АДРЕСА ===
  // Здесь укажи свой адрес (строкой)
  const address = "Чеченская Республика, Гудерместский район, село Нижний Найбер, ул. Садовая, д. 36"

  // (Опционально) координаты для точного попадания
  // Чтобы получить координаты — найди дом в Google Maps, ПКМ → «Что здесь?»
  // и вставь lat/lng:
  const coords = { lat: 43.342123, lng: 46.098765 }  // ← ЗАМЕНИ на свои координаты

  // Формируем ссылку на Google Maps
  const mapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const [routeOpen, setRouteOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 16 }}>
          Кованые изделия
        </h1>

        <div className="flex gap-2">
          {waHref && (
            <a
              className="btn outline flex items-center gap-2"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/whatsapp.svg" alt="" className="w-5 h-5" />
              WhatsApp
            </a>
          )}

          {/* Новая кнопка «Проложить маршрут» */}
          <button className="btn primary" onClick={() => setRouteOpen(true)}>
            Проложить маршрут
          </button>
        </div>
      </div>

      <div className="cat-grid">
        {cards.map(c => (
          <Link
            key={c.key}
            to={c.to}
            className="category-card"
            aria-label={`Открыть категорию ${c.title}`}
          >
            <img
              className="category-card__bg"
              src={c.cover}
              alt={c.title}
              onError={(e) => onImgError(e, c.emojiFallback)}
            />
            <div className="category-card__overlay" />
            <div className="category-card__content">
              <div className="category-card__title">{c.title}</div>
              <div className="category-card__cta">Открыть</div>
            </div>
          </Link>
        ))}
      </div>

      {/* === Модальное окно с адресом === */}
      {routeOpen && (
        <div
          className="modal-backdrop fancy"
          onClick={() => setRouteOpen(false)}
        >
          <div
            className="modal-box slide-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2 className="modal-title">Как нас найти</h2>
              <button
                className="modal-close"
                onClick={() => setRouteOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gap: 16 }}>
              <p>
                Наш адрес:<br />
                <strong>{address}</strong>
              </p>
              <p>
                Нажмите кнопку ниже, чтобы открыть маршрут в Google Картах
                (или другом навигаторе на телефоне).
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary"
              >
                Проложить путь
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
