// Next Imports
import type { Metadata } from 'next'

// Component Imports
import VerifyEmail from '@views/VerifyEmail'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Verfiy Email',
  description: 'Verfiy Email to your account'
}

const VerifyEmailPage = () => {
  // Vars
  const mode = getServerMode()

  return <VerifyEmail mode={mode} />
}

export default VerifyEmailPage
