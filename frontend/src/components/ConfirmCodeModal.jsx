import { useState } from 'react'
import './Modal.css' // можешь сам стилизовать затемнение и центрирование

export default function ConfirmCodeModal({ onSubmit, onClose }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    onSubmit(code)
    setCode('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Введите секретный код</h3>
        <input
          type="password"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Секретный код"
        />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary" type="submit">Подтвердить</button>
        </div>
      </form>
    </div>
  )
}
