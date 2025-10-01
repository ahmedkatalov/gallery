// src/components/ui/Notify.jsx
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const notify = (msg, type = 'default') => {
  toast(msg, {
    type,
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
  })
}

export const NotifyContainer = () => <ToastContainer />
