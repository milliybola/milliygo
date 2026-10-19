import { useContext } from 'react'
import GoLogin from '@/features/go/components/GoLogin'
import { Sheet } from '@/features/go/ui/primitives'
import { AuthContext } from '../context/authContext'

/** Global kirish oynasi: telefonda pastdan chiquvchi varaq, desktopda markaziy oyna */
const GlobalLoginModal = () => {
  const authContext = useContext(AuthContext)
  if (!authContext) return null
  const { isLoginModalOpen, setLoginModalOpen } = authContext
  return (
    <Sheet open={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} width={440}>
      <GoLogin onDone={() => setLoginModalOpen(false)} />
    </Sheet>
  )
}

export default GlobalLoginModal
