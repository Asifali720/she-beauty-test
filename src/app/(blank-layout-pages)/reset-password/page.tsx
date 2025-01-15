// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@views/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset Password to your account'
}

const VerifyEmailPage = () => {
  // Vars
  const mode = getServerMode()

  return <ResetPassword mode={mode} />
}

export default VerifyEmailPage
