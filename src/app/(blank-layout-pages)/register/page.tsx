// Next Imports
import type { Metadata } from 'next'

// Component Imports
// import Register from '@views/Register'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import NotFound from '@/views/NotFound'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register to your account'
}

const RegisterPage = () => {
  // Vars
  const mode = getServerMode()

  return <NotFound mode={mode} />

  // <Register mode={mode} />
}

export default RegisterPage
