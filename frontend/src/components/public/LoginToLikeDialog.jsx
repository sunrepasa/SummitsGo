import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function LoginToLikeDialog({ onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <ConfirmDialog
      icon={Heart}
      title="Masuk dulu untuk menyukai"
      confirmLabel="Masuk"
      cancelLabel="Nanti"
      onConfirm={() => navigate('/login', { state: { from: location.pathname } })}
      onCancel={onClose}
    >
      Kamu perlu login untuk menyukai pendakian ini.
    </ConfirmDialog>
  )
}
