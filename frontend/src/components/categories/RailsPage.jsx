import { useParams } from 'react-router-dom'
import UploadForm from '../UploadForm'
import Gallery from '../Gallery'

export default function RailsPage() {
  const { groupId } = useParams()

  return (
    <>
      <UploadForm />

      <Gallery category="rails" groupId={groupId} />
    </>
  )
}
