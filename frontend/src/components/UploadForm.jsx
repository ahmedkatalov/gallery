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
  return '' // главная и др. роуты
}

export default function UploadForm() {
  const routeCat = useRouteCategory()
  const [desc, setDesc] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState(routeCat || 'gates') // по умолчанию
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef(null)
const navigate = useNavigate();
  // когда роут меняется — подставляем категорию из адреса
  useEffect(() => {
    if (routeCat) setCategory(routeCat)
  }, [routeCat])

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
    if (asArray.length + files.length > 4) toast.warn('Можно выбрать максимум 4 фото')
    setFiles(prev => clamp4([...prev, ...asArray]))
  }
  const onPick = (e) => addFiles(e.target.files)
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); if (!loading) addFiles(e.dataTransfer.files) }
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleUpload = async () => {
    if (files.length < 1 || files.length > 4) return toast.warn('Загрузите от 1 до 4 фото')
    if (!code.trim()) return toast.warn('Введите секретный код')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('code', code.trim())
      fd.set('description', desc)
      fd.set('category', category) // отправляем категорию
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
        <div className="page-toolbar">
          <h1 className="page-title" style={{ margin: 0 }}>{pageTitle}</h1>
          <div className="toolbar-actions">
            {waHref && (
              <a className="btn outline" href={waHref} target="_blank" rel="noopener noreferrer">
                Написать в WhatsApp
              </a>
            )}
            <button  className="btn primary" onClick={() => navigate("/")} >Назад</button>
            <button className="btn primary" onClick={() => setModalOpen(true)}>Добавить фотографии</button>
          </div>
        </div>
      )}

      {/* На главной (/) оставим только кнопку (если нужно) */}
      {!pageTitle && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="btn primary" onClick={() => setModalOpen(true)}>Добавить фотографии</button>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop fancy" onClick={() => !loading && setModalOpen(false)}>
          <div
            className="modal-box slide-up"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <div className="modal-header">
              <h2 className="modal-title">Добавление фотографий</h2>
              <button className="modal-close" onClick={() => !loading && setModalOpen(false)}>×</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Секретный код */}
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, color: '#b9c7d9' }}>
                  Секретный код <span style={{ color: '#f88' }}>*</span>
                </label>
                <input
                  className="input sleek"
                  type="password"
                  placeholder="Введите код"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Категория — если пользователь зашёл на конкретную страницу, показываем активную и блокируем переключение */}
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#b9c7d9' }}>
                  Категория <span style={{ color: '#f88' }}>*</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATS.map(c => {
                    const locked = !!routeCat && c.value !== routeCat
                    return (
                      <label
                        key={c.value}
                        className={`chip ${category === c.value ? 'chip--active' : ''} ${locked ? 'chip--locked' : ''}`}
                        title={locked ? 'Категория выбрана по текущей странице' : ''}
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

              {/* Dropzone */}
              <label
                className={`dropzone ${loading ? 'disabled' : ''}`}
                onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click() }}
                tabIndex={0}
              >
                <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} disabled={loading} hidden />
                <div className="dz-icon">📷</div>
                <div className="dz-text">
                  Перетащите изображения сюда или{' '}
                  <span className="dz-link" onClick={() => inputRef.current?.click()}>выберите</span>
                </div>
                <div className="dz-hint">до 4 файлов • JPEG/PNG/WebP</div>
                <div className="dz-counter">{files.length}/4</div>
              </label>

              {!!previews.length && (
                <div className="thumbs">
                  {previews.map((p, idx) => (
                    <div className="thumb-box" key={p.url}>
                      <img className="thumb-img" src={p.url} alt={p.name || 'preview'} />
                      <button type="button" className="thumb-remove" onClick={() => removeFile(idx)} disabled={loading}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <input
                className="input sleek"
                type="text"
                placeholder="Описание (по желанию)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                disabled={loading}
              />

              <div className="modal-footer">
                <button className="btn" type="button" onClick={() => !loading && setModalOpen(false)}>Отмена</button>
                <button className="btn primary" type="button" onClick={handleUpload} disabled={loading || files.length === 0}>
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
