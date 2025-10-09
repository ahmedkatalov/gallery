import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CategoryGrid() {
  // === КАТЕГОРИИ ===
  const cards = [
    { key: 'gates',  to: '/gates',  title: 'Ворота',  cover: '/images/whatsapp1.jpeg' },
    { key: 'rails',  to: '/rails',  title: 'Перила',  cover: '/images/whatsapp3.jpeg' },
    { key: 'canopy', to: '/canopy', title: 'Навесы',  cover: '/images/whatsapp2.jpeg' },
  ]

  // === WhatsApp ===
  const phoneRaw = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const phoneDigits = phoneRaw.replace(/[^\d]/g, '')
  const waText = `Здравствуйте! Пишу из сайта "Кованые изделия"`
  const waHref = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}`
    : null

  // === Адрес ===
  const address = "Россия, Чеченская Республика, Гудерместский район, село Нижний Найбер, ул. Садовая, д. 36"
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const [routeOpen, setRouteOpen] = useState(false)

  return (
    <>
      {/* === Верхний блок: заголовок + кнопки справа === */}
      <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between mb-8">
        {/* Левая часть */}
        <h1 className="page-title text-3xl font-semibold mb-4 sm:mb-0">
          Кованые изделия
        </h1>

        {/* Правая часть (кнопки) */}
        <div className="flex gap-3 sm:justify-end">
          {waHref && (
            <a
              className="btn outline flex items-center gap-2 whitespace-nowrap"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/iconWhatsapp.png" alt="" className="w-5 h-5" />
              WhatsApp
            </a>
          )}

          <button
            className="btn outline flex items-center gap-2 whitespace-nowrap"
            onClick={() => setRouteOpen(true)}
          >
            <img src="/images/iconMap.png" alt="" className="w-5 h-5" />
            Как нас найти
          </button>
        </div>
      </div>

      {/* === Сетка категорий === */}
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
              onError={(e) => {
                e.currentTarget.src = '/images/fallback.jpg'
              }}
            />
            <div className="category-card__overlay" />
            <div className="category-card__content">
              <div className="category-card__title">{c.title}</div>
              <div className="category-card__cta">Открыть</div>
            </div>
          </Link>
        ))}
      </div>

      {/* === Модальное окно === */}
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
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gap: 16 }}>
              <p style={{ margin: 0 }}>
                Наш адрес:<br />
                <strong>{address}</strong>
              </p>
              <p style={{ margin: 0 }}>
                Нажмите кнопку ниже, чтобы открыть маршрут в Google Картах.
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn primary"
                >
                  Проложить путь
                </a>

                <button
                  className="btn"
                  onClick={() => {
                    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  Открыть карту
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Стили === */}
      <style>{`
        /* --- Карточки --- */
        .category-card__bg { 
          width: 100%; 
          height: 240px; 
          object-fit: cover; 
          border-radius: 8px; 
        }

        /* --- Модалка --- */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .modal-box {
          background: #0b1220;
          color: #e6eef8;
          border-radius: 16px 16px 0 0;
          padding: 20px;
          width: 100%;
          max-width: 600px;
          box-shadow: 0 -6px 30px rgba(3,10,18,0.6);
          animation: slideUp 0.35s ease;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          font-size: 1.4rem;
          line-height: 1;
          cursor: pointer;
          background: transparent;
          border: none;
          color: #dbe9ff;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .modal-close:hover {
          background: rgba(255,255,255,0.02);
        }

        .modal-box .btn.primary {
          background: linear-gradient(180deg, #2b7cff 0%, #1462d6 100%);
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .modal-box .btn {
          background: transparent;
          color: #dbe9ff;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 8px 12px;
          border-radius: 8px;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
