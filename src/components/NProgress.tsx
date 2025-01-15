'use client'

import { useEffect } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

// eslint-disable-next-line import/no-named-as-default
import NProgress from 'nprogress'
import { useTheme } from '@mui/material/styles'

export default function Progress() {
  const theme = useTheme()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  NProgress.configure({
    template: `
      <div class="bar" role="bar" style="
        height: 5px;
        background: ${theme.palette.primary.main};
        pointer-events: none;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 2000;
        position: fixed;
      "></div>
    `
  })

  useEffect(() => {
    NProgress.done()

    return () => {
      NProgress.start()
    }
  }, [pathname, searchParams])

  return <></>
}
