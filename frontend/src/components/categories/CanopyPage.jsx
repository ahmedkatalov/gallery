import { useParams } from 'react-router-dom'
import UploadForm from '../UploadForm'
import Gallery from '../Gallery'

export default function CanopyPage() {
  const { groupId } = useParams()

  return (
    <>
      <UploadForm />

      <Gallery category="canopy" groupId={groupId} />
    </>
  )
}
