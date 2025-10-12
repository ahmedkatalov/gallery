// src/components/UploadForm.jsx
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { toast } from 'react-toastify'

const CATS = [
  { value: 'gates',  label: 'Ворота' },
  { value: 'rails',  label: 'Перила' },
  { value: 'canopy', label: 'Навесы' },
]

// утилита: вытаскиваем категорию из текущего пути
function useRouteCategory() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/gates'))  return 'gates'
  if (pathname.startsWith('/rails'))  return 'rails'
  if (pathname.startsWith('/canopy')) return 'canopy'
  return ''
}

export default function UploadForm() {
  const routeCat = useRouteCategory()
  const [desc, setDesc] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState(routeCat || 'gates')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // когда роут меняется — подставляем категорию из адреса
  useEffect(() => { if (routeCat) setCategory(routeCat) }, [routeCat])

  // превью выбранных файлов
  useEffect(() => {
    const urls = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u.url))
  }, [files])

  const clamp4 = (arr) => arr.slice(0, 4)

  const addFiles = (incoming) => {
    const asArray = Array.from(incoming || [])
    if (!asArray.length) return
    const total = asArray.length + files.length
    if (total > 4) toast.warn('Можно выбрать максимум 4 фото')

    setFiles(prev => clamp4([...prev, ...asArray]))

    // ВАЖНО: сбрасываем инпут, чтобы при выборе тех же файлов снова сработал onChange
    if (inputRef.current) inputRef.current.value = ''
  }

  const onFileInputChange = (e) => {
    addFiles(e.target.files)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loading) addFiles(e.dataTransfer.files)
  }
  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = async () => {
    if (files.length < 1 || files.length > 4) return toast.warn('Загрузите от 1 до 4 фото')
    if (!code.trim()) return toast.warn('Введите секретный код')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('code', code.trim())
      fd.set('description', desc)
      fd.set('category', category)
      files.forEach(f => fd.append('photos', f))

      await api.post('/api/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Фото успешно загружены')
      window.location.reload()
    } catch (err) {
      if (err?.response?.status === 401) toast.error('Неверный секретный код')
      else toast.error('Ошибка загрузки: ' + (err?.response?.data || err.message))
    } finally {
      setLoading(false)
    }
  }

  // заголовок страницы по текущей категории
  const catObj = CATS.find(c => c.value === (routeCat || category))
  const pageTitle = catObj?.label || null

  // WhatsApp кнопка
  const phoneRaw = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const phoneDigits = phoneRaw.replace(/[^\d]/g, '')
  const waText = `Здравствуйте! Пишу со страницы: ${pageTitle || 'Кованые изделия'}`
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waText)}` : null

  return (
    <>
      {/* Тулбар только на страницах категории */}
      {pageTitle && (
        <div className="flex flex-wrap items-center justify-between gap-3 my-2 mb-4">
          <h1 className="text-2xl font-semibold text-white m-0">{pageTitle}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {waHref && (
              <a
                className="px-4 py-2 rounded-xl border border-white/25 text-white/90
                           bg-white/10 hover:bg-white/20 hover:border-white/50
                           backdrop-blur-md transition-all shadow-sm"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать в WhatsApp
              </a>
            )}
            <button
              className="px-4 py-2 rounded-xl border border-white/20 text-white/90
                         bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all"
              onClick={() => navigate('/')}
            >
              Назад
            </button>
            <button
              className="px-4 py-2 rounded-xl text-white
                         bg-gradient-to-r from-blue-400/30 to-blue-600/30
                         border border-blue-400/50 shadow-lg hover:shadow-blue-500/25
                         hover:scale-[1.03] backdrop-blur-md transition-all"
              onClick={() => setModalOpen(true)}
            >
              Добавить фотографии
            </button>
          </div>
        </div>
      )}

      {/* На главной (/) оставим только кнопку (если нужно) */}
      {!pageTitle && (
        <div className="flex justify-end mb-3">
          <button
            className="px-4 py-2 rounded-xl text-white
                       bg-gradient-to-r from-blue-400/30 to-blue-600/30
                       border border-blue-400/50 shadow-lg hover:shadow-blue-500/25
                       hover:scale-[1.03] backdrop-blur-md transition-all"
            onClick={() => setModalOpen(true)}
          >
            Добавить фотографии
          </button>
        </div>
      )}

      {/* === Модальное окно === */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={() => !loading && setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[680px] bg-[#0b0f16]/95 text-white
                       border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                       overflow-hidden animate-[slideUp_0.18s_ease-out]"
            onClick={(e) => e.stopPropagation()}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[.04]">
              <h2 className="text-lg m-0">Добавление фотографий</h2>
              <button
                aria-label="Закрыть"
                className="text-2xl leading-none px-2 rounded-md hover:bg-white/10 transition"
                onClick={() => !loading && setModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* body */}
            <div className="p-4 flex flex-col gap-4">
              {/* Секретный код */}
              <div className="grid gap-1.5">
                <label className="text-sm text-gray-300">
                  Секретный код <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10
                             placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition"
                  type="password"
                  placeholder="Введите код"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Категория */}
              <div className="grid gap-2">
                <div className="text-sm text-gray-300">
                  Категория <span className="text-red-400">*</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {CATS.map(c => {
                    const locked = !!routeCat && c.value !== routeCat
                    const active = category === c.value
                    return (
                      <label
                        key={c.value}
                        title={locked ? 'Категория выбрана по текущей странице' : ''}
                        className={[
                          'px-3 py-1.5 rounded-full border text-sm transition-all',
                          active
                            ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.35)]'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10',
                          locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="cat"
                          value={c.value}
                          checked={category === c.value}
                          onChange={() => setCategory(c.value)}
                          disabled={loading || (!!routeCat && c.value !== routeCat)}
                          hidden
                        />
                        {c.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Скрытый input (не внутри label!) */}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onFileInputChange}
              />

              {/* Dropzone (div/button) — чтобы не было двойного открытия диалога */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => !loading && inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (!loading && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                className={[
                  'relative text-center rounded-xl p-6 border-2 border-dashed bg-white/5',
                  'transition-all cursor-pointer select-none',
                  loading ? 'opacity-60 pointer-events-none' : 'hover:bg-white/7 border-white/30',
                ].join(' ')}
              >
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm text-gray-300">
                  Перетащите изображения сюда или{' '}
                  <span className="text-blue-400 underline">выберите</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">до 4 файлов • JPEG/PNG/WebP</div>
                <div className="absolute top-2 right-3 text-xs text-gray-400">{files.length}/4</div>
              </div>

              {/* Превью выбранных фото */}
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
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={p.url}
                        alt={p.name || 'preview'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        disabled={loading}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full
                                   bg-red-500/90 text-white text-xs grid place-items-center
                                   hover:bg-red-600 transition shadow-md"
                        aria-label="Удалить фото"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Описание */}
              <input
                className="w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10
                           placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition"
                type="text"
                placeholder="Описание (по желанию)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                disabled={loading}
              />

              {/* Футер кнопок */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => !loading && setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-white/80
                             bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || files.length === 0}
                  className={[
                    'px-4 py-2 rounded-xl transition-all shadow-md backdrop-blur-md',
                    loading
                      ? 'bg-blue-400/30 border border-blue-400/30 text-gray-300 cursor-not-allowed'
                      : 'text-white bg-gradient-to-r from-blue-400/30 to-blue-600/40 border border-blue-400/50 hover:scale-[1.03] hover:shadow-blue-500/30',
                  ].join(' ')}
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
