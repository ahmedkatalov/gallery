import { Routes, Route, Navigate } from 'react-router-dom'
import CategoryGrid from './components/CategoryGrid'
import GatesPage from './components/categories/GatesPage'
import RailsPage from './components/categories/RailsPage'
import CanopyPage from './components/categories/CanopyPage'

export default function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<CategoryGrid />} />

        {/* категория с опциональным groupId */}
        <Route path="/gates" element={<GatesPage />} />
        <Route path="/gates/:groupId" element={<GatesPage />} />

        <Route path="/rails" element={<RailsPage />} />
        <Route path="/rails/:groupId" element={<RailsPage />} />

        <Route path="/canopy" element={<CanopyPage />} />
        <Route path="/canopy/:groupId" element={<CanopyPage />} />

        {/* редирект на главную для любых других путей */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

