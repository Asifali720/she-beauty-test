// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { Providers } from '@/provider/Providers'

export const metadata = {
  title: 'She Beauty',
  description: 'She Beauty',
  icons: {
    icon: '/favicon.ico'
  }
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
