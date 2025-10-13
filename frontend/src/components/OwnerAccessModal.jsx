import { useState } from 'react'

export default function OwnerAccessModal({ onClose, onSubmit }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Введите секретный код')
      return
    }

    setLoading(true)
    const masterCode = import.meta.env.VITE_SECRET_CODE || '1234'

    setTimeout(() => {
      if (code.trim() === masterCode) {
        localStorage.setItem('isOwner', 'true')
        localStorage.setItem('ownerCode', code.trim()) // ✅ сохраняем код
        setError('')
        setLoading(false)
        onSubmit?.(code.trim())
        onClose?.()
      } else {
        setError('Неверный секретный код')
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto bg-[#0b0f16]/95 p-6 rounded-2xl border border-white/10
                   text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-[slideUp_0.25s_ease-out]"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          🔒 Вход для владельца
        </h2>

        <input
          type="password"
          placeholder="Введите секретный код"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          className="w-full rounded-lg px-4 py-2.5 bg-white/5 border border-white/10
                     placeholder:text-gray-400 text-white focus:outline-none
                     focus:border-blue-400 transition"
          autoFocus
          disabled={loading}
        />

        {error && (
          <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-white/20 text-white/80
                       bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-[1.02]"
          >
            Отмена
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white font-medium shadow-md backdrop-blur-md transition-all
              ${
                loading
                  ? 'bg-blue-400/30 border border-blue-400/30 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-400/30 to-blue-600/40 border border-blue-400/50 hover:scale-[1.03] hover:shadow-blue-500/30'
              }`}
          >
            {loading ? 'Проверка…' : 'Подтвердить'}
          </button>
        </div>
      </form>

      {/* Анимация */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0.8; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
