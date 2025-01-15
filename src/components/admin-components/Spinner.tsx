// ** MUI Imports
import Image from 'next/image'

import type { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Backdrop, Box } from '@mui/material'

import { SheBeautyLogo } from '@/assets/images'

type Props = {
  sx?: BoxProps['sx']
  open: boolean
  handleClose?: () => void
}

const FallbackSpinner = ({ open, handleClose }: Props) => {
  // ** Hook

  return (
    <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1111111 }} open={open} onClick={handleClose}>
      <Box display='flex' justifyContent='center' alignItems='center' flexDirection={'column'}>
        <Image src={SheBeautyLogo} alt='SheBeautyLogo' width={100} height={100} />
        <CircularProgress disableShrink sx={{ mt: 6 }} />
      </Box>
    </Backdrop>
  )
}

export default FallbackSpinner
