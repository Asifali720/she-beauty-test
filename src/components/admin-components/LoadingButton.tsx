import type { ButtonProps } from '@mui/material'
import { Box, Button, CircularProgress } from '@mui/material'

export interface ExtendedButtonProps extends ButtonProps {
  loading: boolean
  label: string
  loaderColor: string
}

const LoadingButton = ({ loaderColor, loading, label, ...props }: ExtendedButtonProps) => {
  return (
    <Box position='relative' width='100%'>
      <Button fullWidth variant='contained' type='submit' disabled={loading} {...props}>
        {label}
      </Button>

      {loading && (
        <CircularProgress
          disableShrink
          size={24}
          sx={{
            color: loaderColor,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }}
        />
      )}
    </Box>
  )
}

export default LoadingButton
