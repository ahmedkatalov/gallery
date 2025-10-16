import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { toast } from 'react-toastify'

const CATS = [
  { value: 'gates', label: 'Ворота' },
  { value: 'rails', label: 'Перила' },
  { value: 'canopy', label: 'Навесы' },
]

function useRouteCategory() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/gates')) return 'gates'
  if (pathname.startsWith('/rails')) return 'rails'
  if (pathname.startsWith('/canopy')) return 'canopy'
  return ''
}

export default function UploadForm() {
  const routeCat = useRouteCategory()
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState(routeCat || 'gates')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const isOwner = localStorage.getItem('isOwner') === 'true'

  useEffect(() => { if (routeCat) setCategory(routeCat) }, [routeCat])

  useEffect(() => {
    const urls = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u.url))
  }, [files])

  const addFiles = (incoming) => {
    const asArray = Array.from(incoming || [])
    if (!asArray.length) return
    if (asArray.length + files.length > 4) toast.warn('Можно выбрать максимум 4 фото')
    setFiles(prev => prev.concat(asArray).slice(0, 4))
    if (inputRef.current) inputRef.current.value = ''
  }
const handleUpload = async () => {
  if (!files.length) return toast.warn('Загрузите хотя бы одно фото')

  setLoading(true)
  try {
    const fd = new FormData()

    // ✅ Берём реальный код владельца из localStorage (сохраняется при входе)
    const ownerCode = localStorage.getItem('ownerCode')
    if (ownerCode) fd.set('code', ownerCode)

    fd.set('description', desc)
    fd.set('category', category)
    files.forEach(f => fd.append('photos', f))

    await api.post('/api/photos', fd)
    toast.success('Фото успешно загружены')
    window.location.reload()
  } catch (err) {
    toast.error('Ошибка загрузки: ' + (err?.response?.data || err.message))
  } finally {
    setLoading(false)
  }
}


  const catObj = CATS.find(c => c.value === category)
  const pageTitle = catObj?.label || ''

  const phoneRaw = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const phoneDigits = phoneRaw.replace(/[^\d]/g, '')
  const waText = `Здравствуйте! Пишу со страницы: ${pageTitle || 'Кованые изделия'}`
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}` : null

  return (
    <>
      {/* === Верхний тулбар === */}
{pageTitle && (
  <div className="flex flex-wrap items-center justify-between gap-3 my-3">
   <h1
  className="text-3xl sm:text-4xl font-extrabold tracking-wide text-center sm:text-left mb-4 
             text-transparent bg-clip-text bg-gradient-to-b from-[#e6e6e6] to-[#8a8a8a]
             drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
  style={{
    WebkitTextStroke: '0.6px rgba(255,255,255,0.1)',
    textShadow: `
      0 1px 1px rgba(255,255,255,0.3),
      0 2px 3px rgba(0,0,0,0.6),
      0 3px 5px rgba(0,0,0,0.5)
    `,
  }}
>
  {pageTitle}
</h1>


    <div className="flex items-center gap-3 flex-wrap">
      {/* Кнопка "Назад" — видна всегда */}
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 rounded-xl border border-white/20 text-white/90
                   bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all"
      >
        Назад
      </button>

      {/* Кнопка "Добавить фотографии" — только владельцу */}
      {isOwner && (
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl text-white
                     bg-gradient-to-r from-blue-400/30 to-blue-600/30
                     border border-blue-400/50 shadow-lg hover:shadow-blue-500/25
                     hover:scale-[1.03] backdrop-blur-md transition-all"
        >
          Добавить фотографии
        </button>
      )}
    </div>
  </div>
)}

      {/* === Плавающая иконка WhatsApp === */}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Связаться в WhatsApp"
          className="fixed bottom-5 right-5 z-[999]
                     flex items-center justify-center w-[56px] h-[56px]
                     rounded-full bg-[#25D366] shadow-lg 
                     hover:scale-110 hover:shadow-xl 
                     transition-transform duration-300 ease-out"
        >
          <img src="/images/iconWhatsapp.png" alt="WhatsApp" className="w-8 h-8" />
        </a>
      )}

      {/* === Модалка загрузки === */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={() => !loading && setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[680px] bg-[#0b0f16]/95 text-white border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                       overflow-hidden animate-[slideUp_0.18s_ease-out]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[.04]">
              <h2 className="text-lg m-0">Добавление фотографий</h2>
              <button
                className="text-2xl px-2 rounded-md hover:bg-white/10 transition"
                onClick={() => !loading && setModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />

              <div
                onClick={() => !loading && inputRef.current?.click()}
                className="text-center p-6 border-2 border-dashed rounded-xl bg-white/5
                           hover:bg-white/10 border-white/30 cursor-pointer transition-all"
              >
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm text-gray-300">
                  Перетащите изображения сюда или{' '}
                  <span className="text-blue-400 underline">выберите</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">до 4 файлов</div>
              </div>

              {!!previews.length && (
                <div className="flex flex-wrap gap-3 mt-1">
                  {previews.map((p, idx) => (
                    <div
                      key={p.url}
                      className="relative w-[100px] h-[100px] rounded-xl overflow-hidden
                                 border border-white/10 bg-gradient-to-br from-[#1b2332] to-[#0d121a]
                                 shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_14px_rgba(59,130,246,0.45)]
                                 transition-all group"
                    >
                      <img
                        src={p.url}
                        alt={p.name || 'preview'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 text-white text-xs grid place-items-center hover:bg-red-600 transition shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition"
                type="text"
                placeholder="Описание (по желанию)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-white/80 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !files.length}
                  className={`px-4 py-2 rounded-xl transition-all shadow-md backdrop-blur-md ${
                    loading
                      ? 'bg-blue-400/30 border border-blue-400/30 text-gray-300 cursor-not-allowed'
                      : 'text-white bg-gradient-to-r from-blue-400/30 to-blue-600/40 border border-blue-400/50 hover:scale-[1.03] hover:shadow-blue-500/30'
                  }`}
                >
                  {loading ? 'Загрузка…' : 'Подтвердить загрузку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
