import { useState } from 'react'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, itemName = 'элемент' }) {
  const [code, setCode] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    if (!code.trim()) return
    onConfirm?.(code)
    setCode('')
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
      onClick={onClose} // закрытие при клике на фон
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()} // клик внутри не закрывает
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Подтвердите удаление</h2>
          <button className="text-gray-500 hover:text-gray-800 text-2xl" onClick={onClose}>×</button>
        </div>
        <p className="text-gray-700 mb-4">
          Вы собираетесь удалить <strong>{itemName}</strong>. Для подтверждения введите секретный код.
        </p>

        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Введите код"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded border hover:bg-gray-100"
            onClick={() => { setCode(''); onClose() }}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}
