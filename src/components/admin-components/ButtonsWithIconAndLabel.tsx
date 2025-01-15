'use client'

// ** MUI Imports
import type { IconifyIcon } from '@iconify/types'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from '@core/components/icon'

type Props = {
  icon: string | IconifyIcon
  label: string
  onClick?: () => void
}

const ButtonsWithIconAndLabel = ({ icon, label, onClick }: Props) => {
  return (
    <Button variant='contained' startIcon={<Icon icon={icon} />} onClick={onClick}>
      {label}
    </Button>
  )
}

export default ButtonsWithIconAndLabel
