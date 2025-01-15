'use client'
import type { Ref, ReactElement } from 'react'
import React, { forwardRef } from 'react'

import type { SlideProps } from '@mui/material/Slide'
import Slide from '@mui/material/Slide'
import { Box, Card, Dialog, Typography } from '@mui/material'

import Icon from '@core/components/icon'

import CustomCloseButton from './CustomCloseButton'

interface Props {
  handleClose?: React.MouseEventHandler<HTMLButtonElement> | undefined
  open: boolean
  note?: string
}

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

const ViewNoteDialogBox = ({ note, handleClose, open }: Props) => {
  return (
    <Card>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth='sm'
        scroll='body'
        onBackdropClick={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible',
            padding: 3
          }
        }}
        aria-labelledby='note-dialog-title'
        aria-describedby='note-dialog-description'
      >
        <CustomCloseButton onClick={handleClose} aria-label='Close dialog' className='z-10'>
          <Icon icon='tabler:x' fontSize='1.25rem' color='' />
        </CustomCloseButton>

        <Box className='flex flex-row justify-start items-center w-full h-full ml-5 gap-2'>
          <Typography variant='h5' id='note-dialog-title'>
            Note:
          </Typography>
          <Typography variant='body1' textAlign='center' id='note-dialog-description' className='pt-[1.9px]'>
            {note}
          </Typography>
        </Box>
      </Dialog>
    </Card>
  )
}

export default ViewNoteDialogBox
