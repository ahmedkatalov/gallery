import { useParams } from 'react-router-dom'
import UploadForm from '../UploadForm'
import Gallery from '../Gallery'

export default function GatesPage() {
  const { groupId } = useParams()  // получаем groupId из URL

  return (
    <>
      <UploadForm />

      {/* Если groupId есть → показываем конкретный альбом */}
      <Gallery category="gates" groupId={groupId} />
    </>
  )
}

