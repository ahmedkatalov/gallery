// src/components/RouteModal.jsx
export default function RouteModal({ onClose }) {
  // ⚠️ координаты дома (замени на свои при необходимости)
  const coords = { lat: 43.261923, lng: 46.286455 }

  const mapsHref = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`

  return (
    <div className="modal-backdrop fancy" onClick={onClose}>
      <div
        className="modal-box slide-up"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Как нас найти</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: '#666' }}>
            Нажмите на кнопку ниже, чтобы построить маршрут по координатам:
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 13, background: '#f7f7f7', padding: '6px 10px', borderRadius: 6 }}>
            {coords.lat}, {coords.lng}
          </p>
          <a className="btn primary" href={mapsHref} target="_blank" rel="noopener noreferrer">
            Проложить маршрут
          </a>
        </div>
      </div>
    </div>
  )
}
