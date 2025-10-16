import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import OwnerAccessModal from './OwnerAccessModal'

export default function CategoryGrid() {
  const cards = [
    { key: 'gates', to: '/gates', title: 'Ворота', cover: '/images/whatsapp1.jpeg' },
    { key: 'rails', to: '/rails', title: 'Перила', cover: '/images/whatsapp3.jpeg' },
    { key: 'canopy', to: '/canopy', title: 'Навесы', cover: '/images/whatsapp2.jpeg' },
  ]

  const phoneRaw = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const phoneDigits = phoneRaw.replace(/[^\d]/g, '')
  const waText = `Здравствуйте! Пишу из сайта "Кованые изделия"`
  const waHref = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}`
    : null

  const [modalOpen, setModalOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  // Проверяем localStorage
  useEffect(() => {
    const flag = localStorage.getItem('isOwner') === 'true'
    setIsOwner(flag)
  }, [])

  const handleOwnerLogin = (code) => {
    const masterCode = import.meta.env.VITE_SECRET_CODE || '1234'
    if (code.trim() === masterCode) {
      setIsOwner(true)
      localStorage.setItem('isOwner', 'true')
      setModalOpen(false)
    } else {
      alert('Неверный секретный код')
    }
  }

  const handleLogout = () => {
    setIsOwner(false)
    localStorage.removeItem('isOwner')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* === Искры === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="spark"></div>
        ))}
      </div>

      {/* === Контент === */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-center mb-10 
                     text-transparent bg-clip-text bg-gradient-to-b from-[#f5f5f5] to-[#a0a0a0]
                     drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.15)',
            textShadow: `
              0 1px 2px rgba(255,255,255,0.3),
              0 2px 4px rgba(0,0,0,0.8),
              0 3px 6px rgba(0,0,0,0.6)
            `,
          }}
        >
          Кованыеe изделия
        </h1>

        {/* Сетка */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {cards.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="relative block w-[90%] xs:w-[320px] sm:w-[360px] lg:w-[400px] aspect-[16/10]
                         rounded-2xl overflow-hidden bg-[#141922] border border-white/10
                         shadow-[0_10px_24px_rgba(0,0,0,0.25)] transform transition duration-300
                         hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)] hover:border-white/20"
              aria-label={`Открыть категорию ${c.title}`}
            >
              <img
                src={c.cover}
                alt={c.title}
                className="absolute inset-0 w-full h-full object-cover transition duration-300 transform hover:scale-105 hover:saturate-150"
                onError={(e) => { e.currentTarget.src = '/images/fallback.jpg' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/60"></div>
              <div className="absolute left-4 right-4 bottom-4 grid gap-1.5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                <div className="font-semibold text-lg">{c.title}</div>
                <div className="inline-block text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm transition hover:bg-white/20 w-fit">
                  Открыть
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Написать в WhatsApp"
          className="fixed bottom-5 right-5 z-[998]
                     flex items-center justify-center 
                     w-[56px] h-[56px] rounded-full 
                     bg-[#25D366] shadow-lg 
                     hover:scale-110 hover:shadow-xl 
                     transition-transform duration-300 ease-out"
        >
          <img src="/images/iconWhatsapp.png" alt="WhatsApp" className="w-8 h-8" />
        </a>
      )}

      {/* Кнопка владельца */}
      <button
        onClick={() => (isOwner ? handleLogout() : setModalOpen(true))}
        className={`fixed bottom-5 right-[80px] z-[999] flex items-center justify-center w-[56px] h-[56px]
                   rounded-full transition-all duration-300 ease-out 
                   ${isOwner
                     ? 'bg-gradient-to-br from-red-400/70 to-red-600/70 hover:scale-110'
                     : 'bg-gradient-to-br from-blue-400/70 to-blue-600/70 hover:scale-110'} 
                   shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-lg border border-white/20`}
        title={isOwner ? 'Выйти из режима владельца' : 'Войти как владелец'}
      >
        {isOwner ? '×' : '🔑'}
      </button>

      {/* Модалка ввода кода */}
      {modalOpen && (
        <OwnerAccessModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleOwnerLogin}
        />
      )}

      {/* Искры */}
      <style>{`
        .spark {
          position: absolute;
          top: -10px;
          width: 2px;
          height: 8px;
          background: linear-gradient(to bottom, #ffcc00, #ff6600);
          border-radius: 2px;
          opacity: 0.9;
          animation: fall 2s linear infinite;
        }
        .spark:nth-child(1) { left: 5%; animation-duration: 2.2s; animation-delay: 0s; }
        .spark:nth-child(2) { left: 15%; animation-duration: 2.8s; animation-delay: 0.3s; }
        .spark:nth-child(3) { left: 25%; animation-duration: 2.4s; animation-delay: 0.6s; }
        .spark:nth-child(4) { left: 35%; animation-duration: 3s; animation-delay: 1s; }
        .spark:nth-child(5) { left: 45%; animation-duration: 2.3s; animation-delay: 1.5s; }
        .spark:nth-child(6) { left: 55%; animation-duration: 2.9s; animation-delay: 0.8s; }
        .spark:nth-child(7) { left: 65%; animation-duration: 2.5s; animation-delay: 1.2s; }
        .spark:nth-child(8) { left: 75%; animation-duration: 3.2s; animation-delay: 0.5s; }
        .spark:nth-child(9) { left: 85%; animation-duration: 2.7s; animation-delay: 1.1s; }
        .spark:nth-child(10) { left: 95%; animation-duration: 2.6s; animation-delay: 0.2s; }
        @keyframes fall {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          70% { opacity: 0.9; }
          100% { transform: translateY(110vh) scale(0.7); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
